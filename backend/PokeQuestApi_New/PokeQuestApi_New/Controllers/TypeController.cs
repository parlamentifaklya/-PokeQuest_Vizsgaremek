using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class TypeController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        public TypeController(PokeQuestApiContext context)
        {
            _context = context;
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

        [HttpPost]
        public async Task<ActionResult<Models.Type>> CreateType(Models.Type type)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Models.Type newType = new Models.Type
            {
                Name = type.Name,
            };

            await _context.Types.AddAsync(newType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetType), new { id = type.Id }, type);
        }

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

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAbility(int id)
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

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateType(int id, Models.Type updatedType)
        {
            if (id != updatedType.Id)
            {
                return BadRequest();
            }

            var existingType = await _context.Abilities.FindAsync(id);

            if (existingType == null)
            {
                return NotFound();
            }

            existingType.Name = updatedType.Name;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
