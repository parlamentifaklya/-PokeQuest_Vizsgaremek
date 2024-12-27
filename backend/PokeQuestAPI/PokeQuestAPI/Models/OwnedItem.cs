namespace PokeQuestAPI.Models
{
    public class OwnedItem
    {
        public User UserId { get; set; }
        public Item ItemId { get; set; }
        public int Amount { get; set; }
    }
}
