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
using System.Diagnostics.Eventing.Reader;

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
            // Check if the email already exists
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "Email is already in use." });
            }

            var newUser = new User
            {
                UserName = model.UserName,
                Email = model.Email,
                UserLevel = 1
            };

            // Create the user
            var result = await _userManager.CreateAsync(newUser, model.Password);

            if (result.Succeeded)
            {
                // Assign the user to the "User" role
                await _userManager.AddToRoleAsync(newUser, "User");

                // Create the user inventory
                var userInventory = new UserInventory
                {
                    UserId = newUser.Id,
                };

                await _context.UserInventories.AddAsync(userInventory);
                await _context.SaveChangesAsync();

                // Ensure that default Feyling and Item records exist in the database
                var defaultFeylingIds = new List<int> { 3, 4, 5 };
                var defaultItemIds = new List<int> { 45, 46, 47 };

                var feylingExists = await _context.Feylings.AnyAsync(f => defaultFeylingIds.Contains(f.Id));
                var itemExists = await _context.Items.AnyAsync(i => defaultItemIds.Contains(i.Id));

                if (!feylingExists || !itemExists)
                {
                    return BadRequest(new { Message = "Some Feyling or Item records are missing." });
                }

                // Assign the default Feylings to the user's inventory
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

                // Assign the default Items to the user's inventory
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

                // Return success response
                return Ok(new { Message = "User registered successfully!" });
            }

            // Return error if the user could not be created
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

            // Check if the Inventory field is included in the request; if not, ignore it
            if (user.Inventory != null)
            {
                currentUser.Inventory = user.Inventory; // Update the Inventory if provided
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

            // Create the user first
            var result = await _userManager.CreateAsync(newAdmin, model.Password);

            if (result.Succeeded)
            {
                // Automatically assign the "Admin" role to the new user
                var roleResult = await _userManager.AddToRoleAsync(newAdmin, "Admin");

                if (roleResult.Succeeded)
                {
                    _context.SaveChangesAsync();
                    return Ok(new { Message = "Admin user created successfully!" });
                }
                else
                {
                    return BadRequest(new { Message = "Failed to assign role to the admin user", Errors = roleResult.Errors.Select(e => e.Description) });
                }
            }
            else
            {
                return BadRequest(new { Message = "User creation failed", Errors = result.Errors.Select(e => e.Description) });
            }
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

        [HttpGet("{id}")]
        public async Task<ActionResult<IEnumerable<User>>> GetUser(string id)
        {
            var res = await _context.Users.FindAsync(id);
            if (res == null)
            {
                return NotFound();
            }

            return Ok();
        }

        // Add this method in the UserController class
        [Authorize]
        [HttpGet("loggedin")]
        public async Task<IActionResult> GetLoggedIn()
        {
            // Get the current logged-in user based on the JWT claims
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { Message = "User is not authenticated." });
            }

            // Fetch the user from the database
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found." });
            }

            // Fetch roles assigned to the user
            var userRoles = await _userManager.GetRolesAsync(user);

            // Return user data with roles and level
            var userDto = new
            {
                user.Id,
                user.UserName,
                user.Email,
                user.UserLevel,
                Roles = userRoles // Include roles
            };

            return Ok(userDto);
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
