using System;
using System.Collections.Generic;
using System.Windows;

namespace PokeQuestWPF
{
    public partial class MainWindow : Window
    {
        private readonly FeylingService _feylingService;


        public MainWindow()
        {
            InitializeComponent();
            _feylingService = new FeylingService();
            LoadFeylings();
        }

        private async void LoadFeylings()
        {
            try
            {
                if (_feylingService == null)
                {
                    MessageBox.Show("FeylingService is not initialized!", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                List<Feyling> feylings = await _feylingService.GetAllFeylingsAsync();
                FeylingListBox1.ItemsSource = feylings;
                FeylingListBox2.ItemsSource = feylings;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // Check if same Feyling is selected in both lists and enable/disable Battle button
        private void FeylingListBox_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            // Ensure that both Feylings are selected
            if (FeylingListBox1.SelectedItem != null && FeylingListBox2.SelectedItem != null)
            {
                var selectedFeyling1 = FeylingListBox1.SelectedItem as Feyling;
                var selectedFeyling2 = FeylingListBox2.SelectedItem as Feyling;

                // Check if same Feyling is selected in both lists
                if (selectedFeyling1.Id == selectedFeyling2.Id)
                {
                    MessageBox.Show("You cannot select the same Feyling for both columns.", "Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                    BattleButton.IsEnabled = false; // Disable Battle button if same Feyling is selected
                }
                else
                {
                    BattleButton.IsEnabled = true; // Enable Battle button if different Feylings are selected
                }
            }
            else
            {
                BattleButton.IsEnabled = false; // Disable Battle button if not both Feylings are selected
            }
        }

        // Battle button logic
        private async void Battle_Click(object sender, RoutedEventArgs e)
        {
            if (FeylingListBox1.SelectedItem == null || FeylingListBox2.SelectedItem == null)
            {
                MessageBox.Show("Please select one Feyling from each list to battle.", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            Feyling feyling1 = (Feyling)FeylingListBox1.SelectedItem;
            Feyling feyling2 = (Feyling)FeylingListBox2.SelectedItem;

            AbilityService abilityService = new AbilityService();

            try
            {
                Ability ability1 = await abilityService.GetAbilityByIdAsync(feyling1.AbilityId);
                Ability ability2 = await abilityService.GetAbilityByIdAsync(feyling2.AbilityId);

                // Run battle in the background to avoid freezing UI
                string result = await Task.Run(() => Battle(feyling1, feyling2, ability1, ability2));

                MessageBox.Show(result, "Battle Result", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"An error occurred while trying to fetch abilities or battle: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }



        private string Battle(Feyling feyling1, Feyling feyling2, Ability ability1, Ability ability2)
        {
            int feyling1Hp = feyling1.Hp;
            int feyling2Hp = feyling2.Hp;

            int turnpoints1 = 4;  // Initial turnpoints for Feyling 1
            int turnpoints2 = 3;  // Initial turnpoints for Feyling 2

            int abilityCooldown1 = 0;  // Cooldown for Feyling 1's ability
            int abilityCooldown2 = 0;  // Cooldown for Feyling 2's ability

            int turn = 1;  // Initial turn

            // Show the initial battle status
            MessageBox.Show($"Battle started! Feyling 1 HP: {feyling1Hp}, Feyling 2 HP: {feyling2Hp}");

            // Battle loop - Continue until one Feyling's HP reaches 0 or lower
            while (feyling1Hp > 0 && feyling2Hp > 0)
            {
                // Handle Feyling 1's turn (odd turns)
                if (turn % 2 == 1)
                {
                    // Feyling 1 uses its ability first if enough turnpoints are available and the ability is ready
                    if (turnpoints1 >= 2 && abilityCooldown1 == 0 && ability1 != null)
                    {
                        turnpoints1 -= 2;  // Use 2 turnpoints for the ability
                        feyling2Hp -= ability1.Damage;  // Apply ability damage to Feyling 2
                        if (ability1.HealthPoint > 0) feyling1Hp += (int)ability1.HealthPoint;  // Heal Feyling 1 if ability has healing effect
                        abilityCooldown1 = ability1.RechargeTime;  // Set cooldown for ability
                        MessageBox.Show($"Feyling 1 uses ability: Damage: {ability1.Damage}, HP1: {feyling1Hp}, HP2: {feyling2Hp}");
                    }

                    // Feyling 1 attacks if turnpoints are still available
                    if (turnpoints1 > 0)
                    {
                        feyling2Hp -= feyling1.Atk;  // Apply attack damage to Feyling 2
                        turnpoints1--;  // Decrease one turnpoint
                        MessageBox.Show($"Feyling 1 attacks: {feyling1.Atk} damage, HP1: {feyling1Hp}, HP2: {feyling2Hp}");
                    }
                }
                else  // Handle Feyling 2's turn (even turns)
                {
                    // Feyling 2 uses its ability first if enough turnpoints are available and the ability is ready
                    if (turnpoints2 >= 2 && abilityCooldown2 == 0 && ability2 != null)
                    {
                        turnpoints2 -= 2;  // Use 2 turnpoints for the ability
                        feyling1Hp -= ability2.Damage;  // Apply ability damage to Feyling 1
                        if (ability2.HealthPoint > 0) feyling2Hp += (int)ability2.HealthPoint;  // Heal Feyling 2 if ability has healing effect
                        abilityCooldown2 = ability2.RechargeTime;  // Set cooldown for ability
                        MessageBox.Show($"Feyling 2 uses ability: Damage: {ability2.Damage}, HP1: {feyling1Hp}, HP2: {feyling2Hp}");
                    }

                    // Feyling 2 attacks if turnpoints are still available
                    if (turnpoints2 > 0)
                    {
                        feyling1Hp -= feyling2.Atk;  // Apply attack damage to Feyling 1
                        turnpoints2--;  // Decrease one turnpoint
                        MessageBox.Show($"Feyling 2 attacks: {feyling2.Atk} damage, HP1: {feyling1Hp}, HP2: {feyling2Hp}");
                    }
                }

                // Reduce cooldowns after each turn
                if (abilityCooldown1 > 0) abilityCooldown1--;
                if (abilityCooldown2 > 0) abilityCooldown2--;

                // Check if any Feyling has been defeated
                if (feyling1Hp <= 0)
                {
                    return $"{feyling2.Name} wins after {turn} turns!";
                }
                if (feyling2Hp <= 0)
                {
                    return $"{feyling1.Name} wins after {turn} turns!";
                }

                // Increment turn count for the next round
                turn++;

                // After a complete turn (when all turnpoints are used), reset the turnpoints for the next Feyling
                if (turn % 2 == 0)  // Feyling 1's turn is done, now reset Feyling 1's turnpoints
                {
                    turnpoints1 = 4;  // Reset Feyling 1's turnpoints to initial value
                    turnpoints2 = 3;  // Reset Feyling 2's turnpoints to initial value
                }
            }

            return "Battle ended with no winner.";
        }





        private void InfoButton_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Choose 1-1 Feylings from each column to see their fight, who wins, and how many rounds it takes to win.",
                            "Battle Info", MessageBoxButton.OK, MessageBoxImage.Information);
        }

    }
}
