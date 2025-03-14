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

                // Generate random starter Feylings and Items (ensuring no duplicates)
                var random = new Random();
                var feylingIds = Enumerable.Range(3, 30).ToList(); // Feyling IDs from 3 to 32 (inclusive)
                var itemIds = Enumerable.Range(45, 22).ToList(); // Item IDs from 45 to 66 (inclusive)

                var selectedFeylings = new List<int>();
                var selectedItems = new List<int>();

                // Randomly pick 3 unique feyling IDs
                try
                {
                    for (int i = 0; i < 3; i++)
                    {
                        int randomIndex = random.Next(feylingIds.Count);
                        selectedFeylings.Add(feylingIds[randomIndex]);
                        feylingIds.RemoveAt(randomIndex); // Remove the selected feyling ID to avoid duplicates
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Message = "Error while selecting Feylings.", Details = ex.Message });
                }

                // Randomly pick 3 unique item IDs
                try
                {
                    for (int i = 0; i < 3; i++)
                    {
                        int randomIndex = random.Next(itemIds.Count);
                        selectedItems.Add(itemIds[randomIndex]);
                        itemIds.RemoveAt(randomIndex); // Remove the selected item ID to avoid duplicates
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { Message = "Error while selecting Items.", Details = ex.Message });
                }

                // Check if the selected feylings and items exist in the database
                var missingFeylings = await _context.Feylings
                    .Where(f => selectedFeylings.Contains(f.Id))
                    .ToListAsync();
                var missingItems = await _context.Items
                    .Where(i => selectedItems.Contains(i.Id))
                    .ToListAsync();

                if (missingFeylings.Count != selectedFeylings.Count)
                {
                    return BadRequest(new { Message = "Some selected Feylings are missing in the database." });
                }

                if (missingItems.Count != selectedItems.Count)
                {
                    return BadRequest(new { Message = "Some selected Items are missing in the database." });
                }

                // Assign the selected Feylings to the user's inventory
                foreach (var feylingId in selectedFeylings)
                {
                    var ownedFeyling = new OwnedFeyling
                    {
                        UserInventoryId = userInventory.Id,
                        FeylingId = feylingId
                    };
                    await _context.OwnedFeylings.AddAsync(ownedFeyling);
                }
                await _context.SaveChangesAsync();

                // Assign the selected Items to the user's inventory
                foreach (var itemId in selectedItems)
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

            return BadRequest(new { Message = "User registration failed." });
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
                return BadRequest(new { status = "error", message = "Invalid data." });
            }

            // Retrieve the User from the database by UserId (custom User class that has the Inventory and CoinAmount)
            var user = _context.Users
                .Include(u => u.Inventory)   // Include the user's inventory to check if the feyling is present
                .ThenInclude(i => i.OwnedFeylings) // Include owned feylings to check if the feyling exists
                .FirstOrDefault(u => u.Id == request.UserId); // Use the Identity User Id (assuming request.UserId corresponds to IdentityUser.Id)

            if (user == null)
            {
                return NotFound(new { status = "error", message = "User not found." });
            }

            // Check if the Feyling already exists in the user's inventory
            var existingFeyling = user.Inventory.OwnedFeylings
                .FirstOrDefault(ownedFeyling => ownedFeyling.FeylingId == request.FeylingId);

            if (existingFeyling != null)
            {
                // If the Feyling exists, increase the user's CoinAmount based on Feyling's sellPrice
                var feyling = _context.Feylings.FirstOrDefault(f => f.Id == request.FeylingId);
                if (feyling != null)
                {
                    user.CoinAmount += feyling.SellPrice; // Assuming 'SellPrice' is the value to increase the user's coin amount
                    _context.SaveChanges();
                    return Ok(new { status = "success", message = "Feyling is already in the inventory. CoinAmount increased." });
                }
                else
                {
                    return NotFound(new { status = "error", message = "Feyling not found." });
                }
            }
            else
            {
                // If the Feyling does not exist, add it to the UserInventory
                var ownedFeyling = new OwnedFeyling
                {
                    FeylingId = request.FeylingId, // Foreign key to Feyling
                    UserInventoryId = user.Inventory.Id // Reference to the UserInventory
                };

                user.Inventory.OwnedFeylings.Add(ownedFeyling);

                // Save changes to the database
                _context.SaveChanges();
                return Ok(new { status = "success", message = "Feyling added to inventory." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> UpdateCoinAmount([FromBody] CoinUpdateRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.UserId) || request.ChestCost <= 0)
            {
                return BadRequest("UserId and ChestCost are required.");
            }

            // Find the user by their Id (IdentityUser uses a string for Id)
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if the user has enough coins for the chest they are opening
            if (user.CoinAmount < request.ChestCost)
            {
                return BadRequest($"Insufficient coins to open the chest. You need at least {request.ChestCost} coins.");
            }

            // Deduct coins based on chest cost (either 50 or 100 coins)
            user.CoinAmount -= request.ChestCost;

            // Save changes to the database
            await _context.SaveChangesAsync();

            return Ok(new { message = "Coin amount updated successfully", newCoinAmount = user.CoinAmount });
        }

        [HttpPatch]
        public async Task<IActionResult> UpdateUserOnVictory([FromBody] UpdateUserLevelAndCoins updateRequest)
        {
            // Log the incoming request data
            Console.WriteLine("-------------");
            Console.WriteLine($"Received update request: UserLevel = {updateRequest.UserLevel}, UserId = {updateRequest.UserId}");

            var user = await _context.Users.FindAsync(updateRequest.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Check if updateRequest.UserLevel has value before updating
            if (updateRequest.UserLevel.HasValue)
            {
                user.UserLevel += updateRequest.UserLevel.Value;
                Console.WriteLine("-------------");
                Console.WriteLine($"User Level Updated to: {user.UserLevel}");
            }
            else
            {
                Console.WriteLine("UserLevel is null in the request.");
            }

            if (updateRequest.CoinAmountDelta.HasValue) 
            {
                user.CoinAmount += updateRequest.CoinAmountDelta.Value;
                Console.WriteLine("-------------");
                Console.WriteLine($"Coin Amount Updated to: {user.CoinAmount}");
            }
            else
            {
                Console.WriteLine("CoinAmount is null in the request.");
            }

            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return the updated user data
            return Ok(new
            {
                userLevel = user.UserLevel,
                coinAmount = user.CoinAmount
            });
        }


        public class UpdateUserLevelAndCoins
        {
            public string UserId { get; set; }
            public int? UserLevel { get; set; }  // Nullable to indicate it might not be provided
            public int? CoinAmountDelta { get; set; }  // Delta value for coin amount (increment/decrement)
        }

        public class CoinUpdateRequest
        {
            public string UserId { get; set; }
            public int? CoinAmount { get; set; } // The current coin amount the user has
            public int ChestCost { get; set; }   // The cost of opening the chest (50 or 100 coins)
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
