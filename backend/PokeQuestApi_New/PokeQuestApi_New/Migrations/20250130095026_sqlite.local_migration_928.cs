using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeQuestApi_New.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_928 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HealthPoint",
                table: "Abilities",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HealthPoint",
                table: "Abilities");
        }
    }
}
