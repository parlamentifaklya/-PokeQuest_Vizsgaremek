namespace PokeQuestApi_New.Models
{
    public class OwnedItem
    {
        public int Id { get; set; } // Primary key for OwnedItem
        public Item item { get; set; }
        public int ItemId { get; set; } // Foreign key to Item
        public int Amount { get; set; } // Navigation property

        public int UserInventoryId { get; set; } // Foreign key to UserInventory
        public UserInventory UserInventory { get; set; } // Navigation property back to UserInventory
    }
}