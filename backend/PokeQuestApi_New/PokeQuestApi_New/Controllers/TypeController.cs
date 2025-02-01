using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;
using PokeQuestApi_New.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TypeController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        private readonly ImageUploadService _imageUploadService;

        public TypeController(PokeQuestApiContext context, ImageUploadService imageUploadService)
        {
            _context = context;
            _imageUploadService = imageUploadService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetType(int id)
        {
            var res = await _context.Types.FindAsync(id);
            if (res == null)
            {
                return NotFound();
            }
            return Ok(res);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTypes()
        {
            var res = await _context.Types.ToListAsync();
            if (res == null)
            {
                return NotFound();
            }
            return Ok(res);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Models.Type>> CreateType([FromForm] Models.Type type, IFormFile? img)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Handle image upload if provided
            if (img != null)
            {
                try
                {
                    string imagePath = await _imageUploadService.UploadImage(img, "TypeImgs");
                    type.Img = imagePath;  // Save the image path to the model
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            Models.Type newType = new Models.Type
            {
                Name = type.Name,
                Img = type.Img // Set the image path
            };

            await _context.Types.AddAsync(newType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetType), new { id = newType.Id }, newType);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("Type-bulk-insert")]
        public async Task<ActionResult> TypeBulkInsert([FromBody] List<Models.Type> types)
        {
            if (types == null || types.Count == 0)
            {
                return BadRequest();
            }

            await _context.Types.AddRangeAsync(types);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteType(int id)
        {
            var res = await _context.Types.FindAsync(id);

            if (res == null)
            {
                return NotFound();
            }

            _context.Types.Remove(res);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateType(int id, [FromForm] Models.Type updatedType, IFormFile? img)
        {
            if (id != updatedType.Id)
            {
                return BadRequest();
            }

            var existingType = await _context.Types.FindAsync(id);

            if (existingType == null)
            {
                return NotFound();
            }

            // Handle image upload if provided
            if (img != null)
            {
                try
                {
                    string imagePath = await _imageUploadService.UploadImage(img, "TypeImgs");
                    existingType.Img = imagePath;  // Update the image path
                }
                catch (ArgumentException ex)
                {
                    return BadRequest(ex.Message);
                }
            }

            existingType.Name = updatedType.Name;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}