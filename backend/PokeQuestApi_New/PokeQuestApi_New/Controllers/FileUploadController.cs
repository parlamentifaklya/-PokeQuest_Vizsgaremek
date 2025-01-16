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
        private readonly string _uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        public FileUploadController(PokeQuestApiContext context)
        {
            _context = context;
            if (!Directory.Exists(_uploadsDirectory))
            {
                Directory.CreateDirectory(_uploadsDirectory);
            }
        }

        [HttpPost("image-upload")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var uploadsDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");

            var fileName = Path.GetFileName(file.FileName);
            fileName = Path.GetFileNameWithoutExtension(fileName);
            var fileExtension = Path.GetExtension(file.FileName);
            var safeFileName = fileName + fileExtension;

            var filePath = Path.Combine(uploadsDirectory, safeFileName);

            int counter = 1;
            while (System.IO.File.Exists(filePath))
            {
                var newFileName = Path.GetFileNameWithoutExtension(safeFileName) + "_" + counter + fileExtension;
                filePath = Path.Combine(uploadsDirectory, newFileName);
                counter++;
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { FilePath = filePath });
        }

        [HttpGet("all-images")]
        public IActionResult GetAllImages()
        {
            if (!Directory.Exists(_uploadsDirectory))
            {
                return NotFound("Uploads directory not found.");
            }

            var imageFiles = Directory.GetFiles(_uploadsDirectory)
                .Where(file => IsImageFile(file))
                .Select(file => Path.GetFileName(file))
                .ToList();

            if (imageFiles.Count == 0)
            {
                return NotFound("No images found.");
            }

            var imageUrls = imageFiles.Select(file => Url.Action("GetImage", "FileUpload", new { fileName = file }, Request.Scheme)).ToList();

            return Ok(imageUrls);
        }

        private bool IsImageFile(string filePath)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".jfif" };
            var extension = Path.GetExtension(filePath).ToLower();
            return allowedExtensions.Contains(extension);
        }

        [HttpGet("image/{fileName}")]
        public IActionResult GetImage(string fileName)
        {
            var filePath = Path.Combine(_uploadsDirectory, fileName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found.");
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "image/jpeg");
        }
    }
}