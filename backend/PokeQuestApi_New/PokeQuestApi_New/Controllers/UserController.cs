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

        // Register method to register a new user
        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var newUser = new User
            {
                UserName = model.UserName,
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

                return Ok(new { Message = "User registered successfully!" });
            }

            return BadRequest(result.Errors);
        }

        // Login method to authenticate user and generate JWT token
        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                // Fetch roles assigned to the user
                var userRoles = await _userManager.GetRolesAsync(user);

                // Create claims including roles
                var authClaims = new List<Claim>
                {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("User Level", user.UserLevel.ToString()),
                };

                foreach (var role in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Add the multiple audience claims
                var audiences = _configuration.GetSection("Jwt:Audiences").Get<List<string>>(); // Fetch the list of audiences from the config
                foreach (var audience in audiences)
                {
                    authClaims.Add(new Claim(JwtRegisteredClaimNames.Aud, audience));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],  // Issuer defined in your config
                    audience: audiences.First(),  // Set one audience for validation (you can set the first or any audience in the list)
                    expires: DateTime.Now.AddHours(3),  // Set token expiration
                    claims: authClaims,
                    signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)  // Use signing key
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
                });
            }

            return Unauthorized();
        }

        // Update user information (admin only)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateUser(string id, [FromBody] User user)
        {
            var currentUser = await _userManager.FindByIdAsync(id);

            if (currentUser == null)
            {
                return NotFound();
            }

            // Admins can modify other users, so remove this check
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

        // Delete user (admin only)
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(string id)
        {
            var userToDelete = await _userManager.FindByIdAsync(id);

            if (userToDelete == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            // Admins can delete any user, so no need to prevent deletion of own account here
            var result = await _userManager.DeleteAsync(userToDelete);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return NoContent(); // User deleted successfully
        }

        // Create admin user (admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateAdmin([FromBody] RegisterModel model)
        {
            var newAdmin = new User
            {
                UserName = model.UserName,
                Email = model.Email
            };

            var result = await _userManager.CreateAsync(newAdmin, model.Password);

            if (result.Succeeded)
            {
                // Assign the "Admin" role to the new user
                var roleResult = await _userManager.AddToRoleAsync(newAdmin, "Admin");

                if (roleResult.Succeeded)
                {
                    return Ok(new { Message = "Admin user created successfully!" });
                }
                else
                {
                    return BadRequest(new { Message = "Failed to assign role to the admin user", Errors = roleResult.Errors });
                }
            }

            return BadRequest(new { Message = "User creation failed", Errors = result.Errors });
        }

        // Method to get the user's level from claims
        [HttpGet("level")]
        public IActionResult GetUserLevel()
        {
            var userLevel = GetUserLevel(User);
            return Ok(new { UserLevel = userLevel });
        }

        private int GetUserLevel(ClaimsPrincipal user)
        {
            var levelClaim = user.FindFirst("User Level");
            if (levelClaim != null)
            {
                return int.Parse(levelClaim.Value);
            }

            return 0; // Default level
        }

        // Get list of users (admin only)
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers(int page = 1, int pageSize = 10)
        {
            var users = await _userManager.Users.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            if (users == null || users.Count == 0)
            {
                return NotFound(new { Message = "No users found" });
            }

            var userDtos = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user); // Get the roles for each user
                userDtos.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.UserLevel,
                    Roles = roles // Add the roles list to the DTO
                });
            }

            return Ok(userDtos);
        }

        // Model for registering a user
        public class RegisterModel
        {
            public string UserName { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // Model for logging in
        public class LoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
    }
}
