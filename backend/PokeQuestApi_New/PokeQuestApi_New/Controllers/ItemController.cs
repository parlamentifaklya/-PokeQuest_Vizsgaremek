using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        private readonly UserManager<User> _userManager;
        public ItemController(PokeQuestApiContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetItem(int id)
        {
            var result = await _context.Items.FindAsync(id);

            if (result == null)
            {
                return NotFound();
            }

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllItems()
        {
            var result = await _context.Items.ToListAsync();
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem(Item item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newItem = new Item
            {
                Name = item.Name,
                Description = item.Description,
                Img = item.Img,
                Rarity = item.Rarity,
                ItemAbility = item.ItemAbility
            };

            await _context.Items.AddAsync(newItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
        }

        [HttpPost("Item-bulk-insert")]
        public async Task<ActionResult> ItemBulkInsert([FromBody] List<Item> items)
        {
            if (items == null || items.Count == 0)
            {
                return BadRequest();
            }

            await _context.Items.AddRangeAsync(items);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteItem(int id)
        {
            var res = await _context.Items.FindAsync(id);

            if (res == null)
            {
                return NotFound();
            }

            _context.Items.Remove(res);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateItem(int id, Item updatedItem)
        {
            if (id != updatedItem.Id)
            {
                return BadRequest();
            }

            var existingItem = await _context.Items.FindAsync(id);

            if (existingItem == null)
            {
                return NotFound();
            }

            existingItem.ItemAbility = updatedItem.ItemAbility;
            existingItem.Rarity = updatedItem.Rarity;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("unlock/{userInventoryId}/{itemId}/{amount}")]
        public async Task<IActionResult> UnlockItem(int userInventoryId, int itemId, int amount)
        {
            var item = await _context.Items.FindAsync(itemId);
            if (item == null)
            {
                return NotFound("Item not found.");
            }

            var userInventory = await _context.UserInventories.FindAsync(userInventoryId);
            if (userInventory == null)
            {
                return NotFound("User  inventory not found.");
            }

            var user = await _userManager.FindByIdAsync(userInventory.UserId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var existingOwnedItem = await _context.OwnedItems.FirstOrDefaultAsync(oi => oi.UserInventoryId == userInventoryId && oi.ItemId == itemId);
            if (existingOwnedItem != null)
            {
                existingOwnedItem.Amount += amount;
                _context.OwnedItems.Update(existingOwnedItem);
            }
            else
            {
                var ownedItem = new OwnedItem
                {
                    UserInventoryId = userInventoryId,
                    ItemId = itemId,
                    Amount = amount
                };

                await _context.OwnedItems.AddAsync(ownedItem);
            }

            await _context.SaveChangesAsync();

            user.UserLevel++;
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = "Item unlocked successfully!", UserLevel = user.UserLevel });
        }

        [HttpGet("owned/{userInventoryId}")]
        public async Task<IActionResult> GetOwnedItems(int userInventoryId)
        {
            var ownedItems = await _context.OwnedItems.Where(oi => oi.UserInventoryId == userInventoryId).Include(oi => oi.item).ToListAsync();

            if (ownedItems == null || !ownedItems.Any())
            {
                return NotFound("No owned items.");
            }

            return Ok(ownedItems);
        }
    }
}
