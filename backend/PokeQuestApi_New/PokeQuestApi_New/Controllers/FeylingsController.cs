using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;
using PokeQuestApi_New.Services;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class FeylingsController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ImageUploadService _imageUploadService;

        public FeylingsController(PokeQuestApiContext context, UserManager<User> userManager, ImageUploadService imageUploadService)
        {
            _context = context;
            _userManager = userManager;
            _imageUploadService = imageUploadService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeyling(int id)
        {
            var result = await _context.Feylings.FindAsync(id);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllFeylings()
        {
            var result = await _context.Feylings.ToListAsync();
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Feyling>> CreateFeyling([FromForm] CreateFeylingDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if an image is provided
            if (dto.Img == null)
            {
                return BadRequest("An image is required to create a Feyling.");
            }

            // Handle image upload
            try
            {
                string imagePath = await _imageUploadService.UploadImage(dto.Img, "FeylingImgs");

                // Create a new Feyling and set the image path
                var newFeyling = new Feyling
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    Img = imagePath,  // Store the image path
                    TypeId = dto.TypeId,
                    AbilityId = dto.AbilityId,
                    IsUnlocked = dto.IsUnlocked,
                    Hp = dto.Hp,
                    Atk = dto.Atk,
                    ItemId = dto.ItemId ?? null, // Nullable item (can be null)
                    WeakAgainstId = dto.WeakAgainstId,
                    StrongAgainstId = dto.StrongAgainstId,
                    SellPrice = dto.SellPrice
                };

                // Validate TypeId
                var typeExists = await _context.Types.AnyAsync(t => t.Id == dto.TypeId);
                if (!typeExists)
                {
                    return BadRequest("The specified Type does not exist.");
                }

                // Validate AbilityId
                var abilityExists = await _context.Abilities.AnyAsync(a => a.Id == dto.AbilityId);
                if (!abilityExists)
                {
                    return BadRequest("The specified Ability does not exist.");
                }

                // Validate ItemId if it's provided (ItemId can be null)
                if (dto.ItemId.HasValue)
                {
                    var itemExists = await _context.Items.AnyAsync(i => i.Id == dto.ItemId.Value);
                    if (!itemExists)
                    {
                        return BadRequest("The specified Item does not exist.");
                    }
                }

                // Validate WeakAgainstId
                var weakAgainstExists = await _context.Types.AnyAsync(t => t.Id == dto.WeakAgainstId);
                if (!weakAgainstExists)
                {
                    return BadRequest("The specified WeakAgainstId does not exist in the Types table.");
                }

                // Validate StrongAgainstId
                var strongAgainstExists = await _context.Types.AnyAsync(t => t.Id == dto.StrongAgainstId);
                if (!strongAgainstExists)
                {
                    return BadRequest("The specified StrongAgainstId does not exist in the Types table.");
                }

                // Save the new Feyling to the database
                await _context.Feylings.AddAsync(newFeyling);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetFeyling), new { id = newFeyling.Id }, newFeyling);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFeyling(int id, [FromForm] CreateFeylingDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("ID mismatch.");
            }

            var existingFeyling = await _context.Feylings.FindAsync(id);
            if (existingFeyling == null)
            {
                return NotFound("Feyling not found.");
            }

            // Handle image upload if provided
            if (dto.Img != null)
            {
                try
                {
                    string imagePath = await _imageUploadService.UploadImage(dto.Img, "FeylingImgs");
                    existingFeyling.Img = imagePath;  // Update the image path
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            // Update the existing feyling's properties
            existingFeyling.Name = dto.Name;
            existingFeyling.Description = dto.Description;
            existingFeyling.TypeId = dto.TypeId;
            existingFeyling.AbilityId = dto.AbilityId;
            existingFeyling.IsUnlocked = dto.IsUnlocked;
            existingFeyling.Hp = dto.Hp;
            existingFeyling.Atk = dto.Atk;

            // Handle nullable ItemId (only check if ItemId is provided)
            if (dto.ItemId.HasValue)
            {
                // If ItemId is provided, ensure it exists in the database
                var itemExists = await _context.Items.AnyAsync(i => i.Id == dto.ItemId.Value);
                if (!itemExists)
                {
                    return BadRequest("The specified Item does not exist.");
                }
                existingFeyling.ItemId = dto.ItemId;
            }
            else
            {
                // If ItemId is null in the DTO, ensure it remains null in the database
                existingFeyling.ItemId = null;
            }

            existingFeyling.WeakAgainstId = dto.WeakAgainstId;
            existingFeyling.StrongAgainstId = dto.StrongAgainstId;
            existingFeyling.SellPrice = dto.SellPrice;

            // Save the updated Feyling to the database
            await _context.SaveChangesAsync();

            return NoContent(); // Successfully updated
        }


        [HttpPost("Feyling-bulk-insert")]
        public async Task<ActionResult> FeylingBulkInsert([FromBody] List<Feyling> feylings)
        {
            if (feylings == null || feylings.Count == 0)
            {
                return BadRequest();
            }

            await _context.Feylings.AddRangeAsync(feylings);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteFeyling(int id)
        {
            var res = await _context.Feylings.FindAsync(id);

            if (res == null)
            {
                return NotFound();
            }

            _context.Feylings.Remove(res);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("unlock/{userInventoryId}/{feylingId}")]
        public async Task<IActionResult> UnlockFeyling(int userInventoryId, int feylingId)
        {
            var feyling = await _context.Feylings.FindAsync(feylingId);
            if (feyling == null)
            {
                return NotFound("Feyling not found.");
            }

            var userInventory = await _context.UserInventories.FindAsync(userInventoryId);
            if (userInventory == null)
            {
                return NotFound("User inventory not found.");
            }

            var user = await _userManager.FindByIdAsync(userInventory.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var existingOwnedFeyling = await _context.OwnedFeylings.FirstOrDefaultAsync(of => of.UserInventoryId == userInventoryId && of.FeylingId == feylingId);
            if (existingOwnedFeyling != null)
            {
                user.CoinAmount += feyling.SellPrice;
                _context.OwnedFeylings.Remove(existingOwnedFeyling);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Feyling sold for its sale price!", SalePrice = feyling.SellPrice, NewBalance = user.CoinAmount });
            }

            var ownedFeyling = new OwnedFeyling
            {
                UserInventoryId = userInventoryId,
                FeylingId = feylingId
            };

            await _context.OwnedFeylings.AddAsync(ownedFeyling);
            await _context.SaveChangesAsync();

            user.UserLevel++;
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = "New Feyling unlocked!", UserLevel = user.UserLevel });
        }

        [HttpGet("owned/{userInventoryId}")]
        public async Task<IActionResult> GetUnlockedFeylings(int userInventoryId)
        {
            var ownedFeylings = await _context.OwnedFeylings.Where(of => of.UserInventoryId == userInventoryId).Include(of => of.Feyling).ToListAsync();
            if (ownedFeylings == null || !ownedFeylings.Any())
            {
                return NotFound("No unlocked feylings found.");
            }

            return Ok(ownedFeylings.Select(of => of.Feyling));
        }
    }

    public class CreateFeylingDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public IFormFile? Img { get; set; } // For image uploads

        [Required]
        public int TypeId { get; set; } // Foreign key for Type

        [Required]
        public int AbilityId { get; set; } // Foreign key for Ability

        public bool IsUnlocked { get; set; }

        public int Hp { get; set; }

        public int Atk { get; set; }

        public int? ItemId { get; set; } // Nullable foreign key for Item

        public int WeakAgainstId { get; set; } // Nullable foreign key for WeakAgainst

        public int StrongAgainstId { get; set; } // Nullable foreign key for StrongAgainst

        public int SellPrice { get; set; }
    }
}
