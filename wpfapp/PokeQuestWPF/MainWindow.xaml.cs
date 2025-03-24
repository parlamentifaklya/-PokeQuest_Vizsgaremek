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
            Ability ability1 = await abilityService.GetAbilityByIdAsync(feyling1.AbilityId);
            Ability ability2 = await abilityService.GetAbilityByIdAsync(feyling2.AbilityId);

            // Run battle in the background to avoid freezing UI
            string result = await Task.Run(() => Battle(feyling1, feyling2, ability1, ability2));

            MessageBox.Show(result, "Battle Result", MessageBoxButton.OK, MessageBoxImage.Information);
        }


        private string Battle(Feyling feyling1, Feyling feyling2, Ability ability1, Ability ability2)
        {
            int feyling1Hp = feyling1.Hp;
            int feyling2Hp = feyling2.Hp;

            int turnpoints1 = 4;
            int turnpoints2 = 3;

            int abilityCooldown1 = 0;
            int abilityCooldown2 = 0;

            int turn = 1;

            // Both Feylings use their abilities first
            if (ability1 != null && turnpoints1 >= 2)
            {
                turnpoints1 -= 2;
                feyling2Hp -= ability1.Damage;
                if (ability1.HealthPoint > 0) feyling1Hp += (int)ability1.HealthPoint;
                abilityCooldown1 = ability1.RechargeTime;
            }

            if (ability2 != null && turnpoints2 >= 2)
            {
                turnpoints2 -= 2;
                feyling1Hp -= ability2.Damage;
                if (ability2.HealthPoint > 0) feyling2Hp += (int)ability2.HealthPoint;
                abilityCooldown2 = ability2.RechargeTime;
            }

            while (feyling1Hp > 0 && feyling2Hp > 0)
            {
                if (turn % 2 == 1) // Feyling 1's turn
                {
                    if (turnpoints1 > 0)
                    {
                        feyling2Hp -= feyling1.Atk;
                        turnpoints1--;
                    }
                }
                else // Feyling 2's turn
                {
                    if (turnpoints2 > 0)
                    {
                        feyling1Hp -= feyling2.Atk;
                        turnpoints2--;
                    }
                }

                // Reduce cooldowns
                if (abilityCooldown1 > 0) abilityCooldown1--;
                if (abilityCooldown2 > 0) abilityCooldown2--;

                // Check if abilities can be used again
                if (turnpoints1 >= 2 && abilityCooldown1 == 0 && ability1 != null)
                {
                    turnpoints1 -= 2;
                    feyling2Hp -= ability1.Damage;
                    if (ability1.HealthPoint > 0) feyling1Hp += (int)ability1.HealthPoint;
                    abilityCooldown1 = ability1.RechargeTime;
                }

                if (turnpoints2 >= 2 && abilityCooldown2 == 0 && ability2 != null)
                {
                    turnpoints2 -= 2;
                    feyling1Hp -= ability2.Damage;
                    if (ability2.HealthPoint > 0) feyling2Hp += (int)ability2.HealthPoint;
                    abilityCooldown2 = ability2.RechargeTime;
                }

                // If any Feyling reaches 0 HP, the battle ends
                if (feyling1Hp <= 0) return $"{feyling2.Name} wins after {turn} turns!";
                if (feyling2Hp <= 0) return $"{feyling1.Name} wins after {turn} turns!";

                turn++; // Next turn
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
