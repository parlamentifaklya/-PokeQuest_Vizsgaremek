using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestAPI.Data;
using PokeQuestAPI.Models;

namespace PokeQuestAPI.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AbilityController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        public AbilityController(PokeQuestApiContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAbility(int id) 
        {
            var result = await _context.Abilities.FindAsync(id);
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAbilities()
        {
            var result = _context.Abilities.ToListAsync();
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<Ability>> CreateAbility(Ability ability)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            Ability newAbility = new Ability
            {
                Name = ability.Name,
                Description = ability.Description,
                Damage = ability.Damage,
                TypeId = ability.TypeId
            };

            await _context.Abilities.AddAsync(newAbility);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAbility), new { id = ability.Id }, ability);
        }

        [HttpPost("Ability-bulk-insert")]
        public async Task<ActionResult> AbilityBulkInsert([FromBody] List<Ability> abilities)
        {
            if (abilities == null || abilities.Count == 0)
            {
                return NotFound();
            }

            await _context.Abilities.AddRangeAsync(abilities);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete]
        public async Task<ActionResult> DeleteAbility(int id)
        {
            var res = await _context.Abilities.FindAsync(id);

            if(res == null)
            {
                return NotFound();
            }

            _context.Abilities.Remove(res);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAbility(int id, Ability updatedAbility)
        {
            if (id != updatedAbility.Id)
            {
                return BadRequest();
            }

            var existingAbility = await _context.Abilities.FindAsync(id);

            if (existingAbility == null)
            {
                return NotFound();
            }

            existingAbility.Damage = updatedAbility.Damage;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
