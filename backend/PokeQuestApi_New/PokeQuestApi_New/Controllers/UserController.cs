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
using Newtonsoft.Json;
using System.Diagnostics.Eventing.Reader;
using System.Text.Json.Serialization;

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
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id), // Include UserId in the token
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("User Level", user.UserLevel.ToString()),
            new Claim("CoinAmount", user.CoinAmount.ToString()),
        };

                foreach (var role in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, role));
                }

                var audiences = _configuration.GetSection("Jwt:Audiences").Get<List<string>>();
                foreach (var audience in audiences)
                {
                    authClaims.Add(new Claim(JwtRegisteredClaimNames.Aud, audience));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

                var token = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: audiences.First(),
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


        [HttpGet("inventory/{userId}")]
        public async Task<IActionResult> GetInventory(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var userInventory = await _context.UserInventories
                                               .Include(ui => ui.OwnedFeylings)
                                               .ThenInclude(of => of.Feyling)
                                               .Include(ui => ui.OwnedItems)
                                               .ThenInclude(oi => oi.item)
                                               .FirstOrDefaultAsync(ui => ui.UserId == userId);

            if (userInventory == null)
            {
                return NotFound(new { Message = "Inventory not found for this user" });
            }

            var inventoryResponse = new
            {
                UserId = userId,
                UserLevel = user.UserLevel,
                CoinAmount = user.CoinAmount,
                OwnedFeylings = (userInventory.OwnedFeylings ?? new List<OwnedFeyling>()).Select(of => new
                {
                    of.FeylingId,
                    FeylingName = of.Feyling?.Name ?? "Unknown",
                    FeylingDescription = of.Feyling?.Description,
                    FeylingImg = of.Feyling?.Img,
                    FeylingType = of.Feyling?.Type?.Name ?? "None",
                    FeylingAbility = of.Feyling?.Ability?.Name ?? "None",
                    FeylingIsUnlocked = of.Feyling?.IsUnlocked ?? false,
                    FeylingHp = of.Feyling?.Hp ?? 0,
                    FeylingAtk = of.Feyling?.Atk ?? 0,
                    FeylingItem = of.Feyling?.Item != null ? new
                    {
                        Name = of.Feyling.Item.Name,
                        Description = of.Feyling.Item.Description,
                        Img = of.Feyling.Item.Img,
                        ItemAbility = of.Feyling.Item.ItemAbility,
                        Rarity = of.Feyling.Item.Rarity
                    } : null,
                    FeylingWeakAgainst = of.Feyling?.WeakAgainst?.Name ?? "None",
                    FeylingStrongAgainst = of.Feyling?.StrongAgainst?.Name ?? "None",
                    FeylingSellPrice = of.Feyling?.SellPrice ?? 0
                }),
                OwnedItems = (userInventory.OwnedItems ?? new List<OwnedItem>()).Select(oi => new
                {
                    oi.ItemId,
                    ItemName = oi.item?.Name ?? "Unknown",
                    ItemDescription = oi.item?.Description ?? "No description",
                    ItemImg = oi.item?.Img,
                    ItemAbility = oi.item?.ItemAbility,
                    ItemRarity = oi.item?.Rarity,
                    ItemAmount = oi.Amount
                })
            };

            return Ok(inventoryResponse);
        }


        [HttpPost]
        public IActionResult AddItemToInventory([FromBody] AddItemRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.UserId) || request.ItemId <= 0 || request.Amount <= 0)
            {
                return BadRequest(new { message = "Invalid data." });
            }

            // Retrieve the UserInventory from the database by UserId
            var userInventory = _context.UserInventories
                .Include(u => u.OwnedItems)
                .FirstOrDefault(u => u.UserId == request.UserId);

            if (userInventory == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Check if the item already exists in the user's inventory
            var existingItem = userInventory.OwnedItems.FirstOrDefault(o => o.ItemId == request.ItemId);

            if (existingItem != null)
            {
                // If item already exists, increase the amount
                existingItem.Amount += request.Amount;
            }
            else
            {
                // Otherwise, create a new OwnedItem
                var ownedItem = new OwnedItem
                {
                    ItemId = request.ItemId,
                    Amount = request.Amount,
                    UserInventoryId = userInventory.Id // Reference to the UserInventory
                };

                userInventory.OwnedItems.Add(ownedItem);
            }

            // Save changes to the database
            _context.SaveChanges();

            // Return a JSON object with a message
            return Ok(new { message = "Item added to inventory." });
        }

        [HttpPost]
        public IActionResult AddFeylingToInventory([FromBody] AddFeylingRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.UserId) || request.FeylingId <= 0)
            {
                return BadRequest("Invalid data.");
            }

            // Retrieve the UserInventory from the database by UserId
            var userInventory = _context.UserInventories
                .Include(u => u.OwnedFeylings)
                .FirstOrDefault(u => u.UserId == request.UserId);

            if (userInventory == null)
            {
                return NotFound("User not found.");
            }

            // Add the Feyling to the UserInventory
            var ownedFeyling = new OwnedFeyling
            {
                FeylingId = request.FeylingId, // Foreign key to Feyling
                UserInventoryId = userInventory.Id // Reference to the UserInventory
            };

            userInventory.OwnedFeylings.Add(ownedFeyling);

            // Save changes to the database
            _context.SaveChanges();

            return Ok("Feyling added to inventory.");
        }

        public class AddFeylingRequest
        {
            public string UserId { get; set; }
            public int FeylingId { get; set; }
        }


        public class AddItemRequest
        {
            public string UserId { get; set; }
            public int ItemId { get; set; }
            public int Amount { get; set; }
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
