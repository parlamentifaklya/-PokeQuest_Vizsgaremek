namespace PokeQuestAPI.Models
{
    public class Feyling
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImgUrl { get; set; }
        public Type Type { get; set; }
        public Ability Ability { get; set; }
        public bool IsUnlocked { get; set; }
        public int Hp { get; set; }
        public int Atk { get; set; }
        public Item? Item { get; set; }
        public Type WeakAgainst { get; set; }
        public Type StrongAgainst { get; set; }
        public int SellPrice { get; set; }
    }
}
