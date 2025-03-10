public class Feyling
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Img { get; set; }
    public int TypeId { get; set; }
    public int AbilityId { get; set; }
    public bool IsUnlocked { get; set; }
    public int Hp { get; set; }
    public int Atk { get; set; }
    public int? ItemId { get; set; }
    public int WeakAgainstId { get; set; }
    public int StrongAgainstId { get; set; }
    public int SellPrice { get; set; }
}
