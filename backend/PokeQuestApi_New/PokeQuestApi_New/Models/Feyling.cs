using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeQuestApi_New.Models
{
    public class Feyling
    {
        [Key]
        public int Id { get; set; } // Primary key

        [Required] // Ensures that Name is required
        public string Name { get; set; }

        public string Description { get; set; }

        public string Img { get; set; }

        // Foreign key for Type
        public int TypeId { get; set; } // Assuming Type is another entity with a primary key
        [ForeignKey("TypeId")]
        public Type Type { get; set; } // Navigation property

        // Foreign key for Ability
        public int AbilityId { get; set; } // Assuming Ability is another entity with a primary key
        [ForeignKey("AbilityId")]
        public Ability Ability { get; set; } // Navigation property

        public bool IsUnlocked { get; set; }

        public int Hp { get; set; }

        public int Atk { get; set; }

        // Foreign key for Item
        public int? ItemId { get; set; } // Assuming Item is another entity with a primary key
        [ForeignKey("ItemId")]
        public Item? Item { get; set; } // Navigation property

        // Foreign key for WeakAgainst
        public int WeakAgainstId { get; set; } // Assuming WeakAgainst is another entity with a primary key
        [ForeignKey("WeakAgainstId")]
        public Type WeakAgainst { get; set; } // Navigation property

        // Foreign key for StrongAgainst
        public int StrongAgainstId { get; set; } // Assuming StrongAgainst is another entity with a primary key
        [ForeignKey("StrongAgainstId")]
        public Type StrongAgainst { get; set; } // Navigation property

        public int SellPrice { get; set; }
    }
}