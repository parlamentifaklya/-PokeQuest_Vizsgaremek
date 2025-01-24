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
using Microsoft.AspNetCore.Authorization;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private readonly PokeQuestApiContext _context;

        public UserController(UserManager<User> userManager, IConfiguration configuration, PokeQuestApiContext context)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var newUser = new User
            {
                UserName = model.UsserName,
                Email = model.Email,
                UserLevel = 1
            };

            var result = await _userManager.CreateAsync(newUser, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(newUser, "User");

                var userInventory = new UserInventory
                {
                    UserId = newUser.Id,
                };

                await _context.UserInventories.AddAsync(userInventory);
                await _context.SaveChangesAsync();

                var defaultFeylingIds = new List<int> { 1, 2, 3 };
                foreach (var feylingId in defaultFeylingIds)
                {
                    var ownedFeyling = new OwnedFeyling
                    {
                        UserInventoryId = userInventory.Id,
                        FeylingId = feylingId
                    };
                    await _context.OwnedFeylings.AddAsync(ownedFeyling);
                }
                await _context.SaveChangesAsync();

                var defaultItemIds = new List<int> { 1, 2, 3 };
                foreach (var itemId in defaultItemIds)
                {
                    var ownedItem = new OwnedItem
                    {
                        UserInventoryId = userInventory.Id,
                        ItemId = itemId,
                        Amount = 1
                    };
                    await _context.OwnedItems.AddAsync(ownedItem);
                }
                await _context.SaveChangesAsync();

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
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim("User Level", user.UserLevel.ToString())
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

        [Authorize(Roles = "Admin")]
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

        [Authorize(Roles = "Admin")]
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

        [Authorize(Roles = "Admin")]
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] RegisterModel model)
        {
            var newAdmin = new User
            {
                UserName = model.UsserName,
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(newAdmin, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(newAdmin, "Admin");
                return Ok(new { Message = "Admin user created successfully!" });
            }

            return BadRequest(result.Errors);
        }

        [HttpGet("level")]
        public IActionResult GetUserLevel()
        {
            var userLevel = GetUserLevel(User);
            return Ok(new { UserLevel = userLevel });
        }

        private int GetUserLevel(ClaimsPrincipal user)
        {
            var levelClaim = user.FindFirst("User  Level");
            if (levelClaim != null)
            {
                return int.Parse(levelClaim.Value);
            }

            return 0;
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
