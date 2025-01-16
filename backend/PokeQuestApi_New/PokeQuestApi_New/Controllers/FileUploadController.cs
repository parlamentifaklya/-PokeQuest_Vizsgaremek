using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PokeQuestApi_New.Data;

namespace PokeQuestApi_New.Controllers
{
    [EnableCors("AllowALlOrigins")]
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly PokeQuestApiContext _context;
        public FileUploadController(PokeQuestApiContext context)
        {
            context = _context;
        }

        [HttpPost("image-upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null ||file.Length == 0)
            {
                return BadRequest("No file to upload.");
            }

            var filePath = Path.Combine("Uploads", file.Name);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { FilePath = filePath });
        }
    }
}
