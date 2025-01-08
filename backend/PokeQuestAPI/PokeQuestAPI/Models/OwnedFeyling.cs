namespace PokeQuestAPI.Models
{
    public class OwnedFeyling
    {
        public int Id { get; set; } // Primary key for OwnedFeyling

        public int FeylingId { get; set; } // Foreign key to Feyling
        public Feyling Feyling { get; set; } // Navigation property

        public int UserInventoryId { get; set; } // Foreign key to UserInventory
        public UserInventory UserInventory { get; set; } // Navigation property back to UserInventory
    }
}