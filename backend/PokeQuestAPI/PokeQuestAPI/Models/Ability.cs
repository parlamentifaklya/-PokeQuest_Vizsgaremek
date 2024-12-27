namespace PokeQuestAPI.Models
{
    public class Ability
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int Damage { get; set; }
        public Type Type { get; set; }
    }
}
