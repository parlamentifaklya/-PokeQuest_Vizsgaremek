using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class FeylingsController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        public FeylingsController(PokeQuestApiContext context)
        {
            _context = context;
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
        public async Task<ActionResult<Feyling>> CreateFeyling(Feyling feyling)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newFeyling = new Feyling
            {
                Name = feyling.Name,
                Description = feyling.Description,
                ImgUrl = feyling.ImgUrl,
                TypeId = feyling.TypeId,
                AbilityId = feyling.AbilityId,
                IsUnlocked = feyling.IsUnlocked,
                Hp = feyling.Hp,
                Atk = feyling.Atk,
                ItemId = feyling.ItemId,
                WeakAgainstId = feyling.WeakAgainstId,
                StrongAgainstId = feyling.StrongAgainstId,
                SellPrice = feyling.SellPrice
            };

            await _context.Feylings.AddAsync(newFeyling);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFeyling), new { id =  feyling.Id }, feyling);
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

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateFeyling(int id, Feyling updatedFeyling)
        {
            if (id != updatedFeyling.Id)
            {
                return BadRequest();
            }

            var existingFeyling = await _context.Feylings.FindAsync(id);

            if (existingFeyling == null)
            {
                return NotFound();
            }

            existingFeyling.Hp = updatedFeyling.Hp;
            existingFeyling.Atk = updatedFeyling.Atk;
            existingFeyling.SellPrice = updatedFeyling.SellPrice;

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

            var existingOwnedFeyling = await _context.OwnedFeylings.FirstOrDefaultAsync(of => of.UserInventoryId == userInventoryId && of.FeylingId == feylingId);
            if (existingOwnedFeyling != null)
            {
                return BadRequest("Feyling already unlocked.");
            }

            var ownedFeyling = new OwnedFeyling
            {
                UserInventoryId = userInventoryId,
                FeylingId = feylingId
            };

            await _context.OwnedFeylings.AddAsync(ownedFeyling);
            await _context.SaveChangesAsync();

            return Ok("New Feyling unlocked!");
        }

        [HttpGet("unlocked/{userInventoryId}")]
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
}
