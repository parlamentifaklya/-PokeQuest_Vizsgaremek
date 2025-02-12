using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;
using PokeQuestApi_New.Services;
using System.IO;
using System.Threading.Tasks;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        private readonly ImageUploadService _imageUploadService;

        // Injecting context and image upload service
        public ItemController(PokeQuestApiContext context, ImageUploadService imageUploadService)
        {
            _context = context;
            _imageUploadService = imageUploadService;
        }

        // Get a single item by ID
        [HttpGet]
        public async Task<IActionResult> GetItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }

        // Get all items
        [HttpGet("all")]
        public async Task<IActionResult> GetAllItems()
        {
            var items = await _context.Items.ToListAsync();
            if (items == null || items.Count == 0)
            {
                return NotFound("No items found.");
            }
            return Ok(items);
        }

        // Create a new item (with optional image upload)
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Item>> CreateItem([FromForm] Item item, IFormFile file)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string filePath = null;
            if (file != null)
            {
                // Upload the image and get the file path
                filePath = await _imageUploadService.UploadImage(file, "ItemImgs");
            }

            var newItem = new Item
            {
                Name = item.Name,
                Description = item.Description,
                Img = filePath,  // Save the file path in Img
                ItemAbility = item.ItemAbility,
                Rarity = item.Rarity
            };

            // Add new item to the database
            await _context.Items.AddAsync(newItem);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetItem), new { id = newItem.Id }, newItem);
        }

        // Update an existing item (with optional image upload)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(int id, [FromForm] Item updatedItem, IFormFile file)
        {
            if (id != updatedItem.Id)
            {
                return BadRequest("Item ID mismatch.");
            }

            var existingItem = await _context.Items.FindAsync(id);
            if (existingItem == null)
            {
                return NotFound("Item not found.");
            }

            // If a new file is uploaded, update the Img field
            if (file != null)
            {
                string filePath = await _imageUploadService.UploadImage(file, "ItemImgs");
                existingItem.Img = filePath; // Update the Img field with the new image path
            }

            // Update the other properties
            existingItem.Name = updatedItem.Name;
            existingItem.Description = updatedItem.Description;
            existingItem.ItemAbility = updatedItem.ItemAbility;
            existingItem.Rarity = updatedItem.Rarity;

            _context.Items.Update(existingItem);
            await _context.SaveChangesAsync();

            return NoContent(); // No content means the update was successful but no data to return
        }

        // Delete an item by ID
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteItem(int id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            _context.Items.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Bulk insert items
        [HttpPost("bulk-insert")]
        public async Task<ActionResult> BulkInsertItems([FromForm] List<Item> items, [FromForm] List<IFormFile> files)
        {
            if (items == null || items.Count == 0)
            {
                return BadRequest("No items to insert.");
            }

            if (files != null && files.Count != items.Count)
            {
                return BadRequest("The number of files must match the number of items.");
            }

            // List to hold the items that will be added to the database
            var itemsToAdd = new List<Item>();

            for (int i = 0; i < items.Count; i++)
            {
                var item = items[i];

                // If there is a file for the current item, upload it and get the file path
                if (files != null && files.Count > i && files[i] != null)
                {
                    var filePath = await _imageUploadService.UploadImage(files[i], "ItemImgs");
                    item.Img = filePath;  // Set the Img field to the uploaded file path
                }

                // Add the item to the list that will be inserted into the database
                itemsToAdd.Add(item);
            }

            // Bulk insert the items into the database
            await _context.Items.AddRangeAsync(itemsToAdd);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Items inserted successfully!" });
        }
    }
}
