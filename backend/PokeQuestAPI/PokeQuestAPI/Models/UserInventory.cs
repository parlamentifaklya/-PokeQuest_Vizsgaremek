namespace PokeQuestAPI.Models
{
    public class UserInventory
    {
        public int Id { get; set; } // Primary key for UserInventory
        public List<OwnedFeyling> OwnedFeylings { get; set; } = new List<OwnedFeyling>();
        public List<OwnedItem> UserItems { get; set; } = new List<OwnedItem>();

        public string UserId { get; set; } // Foreign key to User
        public User User { get; set; } // Navigation property back to User
    }
}