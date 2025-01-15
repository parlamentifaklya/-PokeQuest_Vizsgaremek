using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using PokeQuestApi_New.Models;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using Microsoft.AspNetCore.Cors;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public UserController(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var newUser = new User
            {
                UserName = model.UsserName,
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(newUser, model.Password);

            if (result.Succeeded)
            {
                return Ok(new { Message = "User registered successfully!"});
            }

            return BadRequest(result.Errors);
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                var authClaims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    expires: DateTime.Now.AddHours(3),
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
                });
            }

            return Unauthorized();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string username, User user)
        {
            var currentUser = await _userManager.FindByNameAsync(username);

            if (currentUser == null)
            {
                return NotFound();
            }

            if (currentUser.UserName != _userManager.GetUserName(User))
            {
                return Forbid();
            }

            if (!string.IsNullOrEmpty(user.UserName))
            {
                currentUser.UserName = user.UserName;
            }

            if (!string.IsNullOrEmpty(user.Email))
            {
                currentUser.Email = user.Email;
            }

            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(currentUser);
                var result = await _userManager.ResetPasswordAsync(currentUser, token, user.PasswordHash);
                if (!result.Succeeded)
                {
                    return BadRequest(result.Errors);
                }
            }

            var updateResult = await _userManager.UpdateAsync(currentUser);
            if (!updateResult.Succeeded)
            {
                return BadRequest(updateResult.Errors);
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var userToDelete = await _userManager.FindByIdAsync(id.ToString());

            if (userToDelete == null)
            {
                return NotFound();
            }

            if (userToDelete.Id != _userManager.GetUserId(User))
            {
                return Forbid();
            }

            var result = await _userManager.DeleteAsync(userToDelete);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent();
        }

    }

    public class RegisterModel
    {
        public string UsserName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
