using System.ComponentModel.DataAnnotations;

namespace PokeQuestApi_New.Models
{
    public class Type
    {
        [Key] // This attribute specifies that Id is the primary key
        public int Id { get; set; }

        [Required] // This attribute specifies that Name is required
        public string Name { get; set; }
        public string Img { get; set; }
    }
}
