using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeQuestApi_New.Models
{
    public class Ability
    {
        [Key] // This attribute specifies that Id is the primary key
        public int Id { get; set; }

        [Required] // This attribute specifies that Name is required
        public string Name { get; set; }

        public string Img { get; set; }

        public string Description { get; set; }

        public int Damage { get; set; }

        // Foreign key for Type
        public int TypeId { get; set; } // Assuming Type is another entity with a primary key
        [ForeignKey("TypeId")]
        public Type Type { get; set; } // Navigation property
    }
}
