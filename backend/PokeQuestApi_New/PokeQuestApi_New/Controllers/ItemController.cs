using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
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
        public ItemController(PokeQuestApiContext context)
        {
            _context = context;
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
    }
}
