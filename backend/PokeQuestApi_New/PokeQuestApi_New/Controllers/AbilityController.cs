﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeQuestApi_New.Data;
using PokeQuestApi_New.Models;
using PokeQuestApi_New.Services;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class AbilityController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        private readonly ImageUploadService _imageUploadService;

        public AbilityController(PokeQuestApiContext context, ImageUploadService imageUploadService)
        {
            _context = context;
            _imageUploadService = imageUploadService;
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
            var result = await _context.Abilities.ToListAsync();
            if (result == null || result.Count == 0)
            {
                return NotFound("No abilities found.");
            }
            return Ok(result);
        }

        // Create a new ability with optional image upload
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Ability>> CreateAbility([FromForm] CreateAbilityDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string filePath = null;
            if (dto.File != null)
            {
                filePath = await _imageUploadService.UploadImage(dto.File, "AbilityImgs");
            }

            Ability newAbility = new Ability
            {
                Name = dto.Name,
                Description = dto.Description,
                Damage = dto.Damage,
                HealthPoint = dto.HealthPoint,
                RechargeTime = dto.RechargeTime,
                TypeId = dto.TypeId,
                Img = filePath  // Store the image file path
            };

            await _context.Abilities.AddAsync(newAbility);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAbility), new { id = newAbility.Id }, newAbility);
        }

        // Delete ability by ID
        [Authorize(Roles = "Admin")]
        [HttpDelete]
        public async Task<ActionResult> DeleteAbility(int id)
        {
            var ability = await _context.Abilities.FindAsync(id);
            if (ability == null)
            {
                return NotFound();
            }

            _context.Abilities.Remove(ability);
            await _context.SaveChangesAsync();

            return Ok();
        }

        // Update an existing ability with optional image upload
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAbility(int id, [FromForm] CreateAbilityDto dto)
        {
            if (id != dto.Id)
            {
                return BadRequest("Ability ID mismatch.");
            }

            var existingAbility = await _context.Abilities.FindAsync(id);
            if (existingAbility == null)
            {
                return NotFound("Ability not found.");
            }

            // If a file is uploaded, update the image
            if (dto.File != null)
            {
                var filePath = await _imageUploadService.UploadImage(dto.File, "AbilityImgs");
                existingAbility.Img = filePath;  // Update the Img field
            }

            existingAbility.Name = dto.Name;
            existingAbility.Description = dto.Description;
            existingAbility.Damage = dto.Damage;
            existingAbility.HealthPoint = dto.HealthPoint;
            existingAbility.RechargeTime = dto.RechargeTime;
            existingAbility.TypeId = dto.TypeId;

            _context.Abilities.Update(existingAbility);
            await _context.SaveChangesAsync();

            return NoContent(); // Successfully updated
        }
    }
    public class CreateAbilityDto
    {
        public int Id { get; set; }
        public IFormFile File { get; set; } // For file uploads

        [Required]
        public string Name { get; set; }

        public string Description { get; set; }

        public int Damage { get; set; }

        public int HealthPoint {  get; set; }

        public int RechargeTime {  get; set; }

        [Required]
        public int TypeId { get; set; } // Only include TypeId
    }
}