using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeQuestApi_New.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_915 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feylings_Items_ItemId",
                table: "Feylings");

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "Feylings",
                type: "INTEGER",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "INTEGER");

            migrationBuilder.AddForeignKey(
                name: "FK_Feylings_Items_ItemId",
                table: "Feylings",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Feylings_Items_ItemId",
                table: "Feylings");

            migrationBuilder.AlterColumn<int>(
                name: "ItemId",
                table: "Feylings",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "INTEGER",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Feylings_Items_ItemId",
                table: "Feylings",
                column: "ItemId",
                principalTable: "Items",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
