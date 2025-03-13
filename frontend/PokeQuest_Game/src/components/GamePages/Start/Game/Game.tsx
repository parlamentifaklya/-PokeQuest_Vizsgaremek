import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useFeyling } from '../../../../context/FeylingContext';
import styles from './Game.module.css';
import { GetAllAbility, GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';
import { Ability } from '../../../../types/Ability';
import { useNavigate } from 'react-router-dom';
import { updateUserOnVictory } from '../../../../services/ApiServices'; // Import the updateUserOnVictory function
import Header from '../../../../modules/Header';
import { div } from 'framer-motion/client';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const { selectedFeyling } = useFeyling();
  const navigate = useNavigate();  // For navigation
  const [turn, setTurn] = useState<'Player' | 'Enemy'>('Player');
  const [playerHP, setPlayerHP] = useState<number>(selectedFeyling?.feylingHp ?? 100);
  const [enemyHP, setEnemyHP] = useState<number>(100);
  const [playerTurnPoints, setPlayerTurnPoints] = useState<number>(3);
  const [enemyTurnPoints, setEnemyTurnPoints] = useState<number>(3);
  const [enemyFeyling, setEnemyFeyling] = useState<Feyling | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [playerFeyling, setPlayerFeyling] = useState<Feyling | null>(null);

  const [tooltipText, setTooltipText] = useState<string>('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [playerAbilityCooldown, setPlayerAbilityCooldown] = useState<number>(0);  // Store cooldown in state
  const [enemyAbilityCooldown, setEnemyAbilityCooldown] = useState<number>(0);    // Store cooldown in state

  const FEYLING_IMAGE_SIZE = 200; // Set the fixed size for all images (adjust this as needed)
  const ABILITY_IMAGE_SIZE = 75;

  const victoryHandledRef = useRef<boolean>(false);

  // Fetch abilities
  useEffect(() => {
    const fetchAbilities = async () => {
      try {
        const data = await GetAllAbility();
        setAbilities(data);
      } catch (error) {
        console.error('Failed to fetch Abilities:', error);
      }
    };
    fetchAbilities();
  }, []);

  // Fetch feylings (player & enemy)
  useEffect(() => {
    const fetchFeylings = async () => {
      try {
        const data = await GetAllFeylings();
        if (data.length > 0) {
          const foundPlayerFeyling = data.find((feyling) => feyling.id === selectedFeyling?.feylingId);
          if (foundPlayerFeyling) {
            setPlayerFeyling(foundPlayerFeyling);
          }

          const randomIndex = Math.floor(Math.random() * data.length);
          setEnemyFeyling(data[randomIndex]);
          setEnemyHP(data[randomIndex].hp);
        }
      } catch (error) {
        console.error('Failed to fetch Feylings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeylings();
  }, [selectedFeyling?.feylingId]);

  // Using `useEffect` to detect when enemy turn points hit 0 and switch turn
  useEffect(() => {
    if (enemyTurnPoints <= 0 && turn === 'Enemy') {
      console.log('Enemy turn is over. Switch to Player!');
      setTurn('Player');
      setEnemyTurnPoints((prev) => prev + 3)
    }
  }, [enemyTurnPoints, turn]);

  const getAbility = (abilityId: number | undefined): Ability | null => {
    return abilities.find((ability) => ability.id === abilityId) || null;
  };

  const ability = playerFeyling ? getAbility(playerFeyling.abilityId) : null;
  const enemyAbility = enemyFeyling ? getAbility(enemyFeyling.abilityId) : null;

  useEffect(() => {
    if (!gameRef.current || gameInstance.current || !playerFeyling) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 600,
      parent: gameRef.current,
      scene: {
        key: 'MainScene',
        preload: preload,
        create: create,
        update: update,
      },
    };

    gameInstance.current = new Phaser.Game(config);

    let playerSprite: Phaser.GameObjects.Image;
    let enemySprite: Phaser.GameObjects.Image;
    let playerAbilitySprite: Phaser.GameObjects.Image;
    let enemyAbilitySprite: Phaser.GameObjects.Image;
    let nextTurnText: Phaser.GameObjects.Text;
    let playerHealthText: Phaser.GameObjects.Text;
    let enemyHealthText: Phaser.GameObjects.Text;
    let playerTurnPointsText: Phaser.GameObjects.Text;
    let enemyTurnPointsText: Phaser.GameObjects.Text;

    let tooltipBackground: Phaser.GameObjects.Graphics;
    let playerAbilityCooldownText: Phaser.GameObjects.Text;
    let enemyAbilityCooldownText: Phaser.GameObjects.Text;

    function preload(this: Phaser.Scene) {
      this.load.image('background', 'bg.png');
      this.load.image('player', playerFeyling?.img || 'defaultImage.png');
      this.load.image('enemy', enemyFeyling?.img || 'defaultEnemyImg.png');
      if (ability?.img) this.load.image('ability', ability.img);
      else this.load.image('ability', 'defaultAbilityImage.png');
      if (enemyAbility?.img) this.load.image('enemyAbility', enemyAbility.img);
      else this.load.image('enemyAbility', 'defaultAbilityImage.png');
    }

    function create(this: Phaser.Scene) {
      this.add.image(500, 300, 'background').setDisplaySize(1000, 600);

      // Player and Enemy sprites with fixed size
      playerSprite = this.add.image(200, 300, 'player').setDisplaySize(FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);
      enemySprite = this.add.image(800, 300, 'enemy').setDisplaySize(FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);

      // Borders around images
      const playerBorder = this.add.graphics();
      playerBorder.lineStyle(4, 0x00ff00, 1); // Green border for the player
      playerBorder.strokeRect(playerSprite.x - FEYLING_IMAGE_SIZE / 2, playerSprite.y - FEYLING_IMAGE_SIZE / 2, FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);

      const enemyBorder = this.add.graphics();
      enemyBorder.lineStyle(4, 0xff0000, 1); // Red border for the enemy
      enemyBorder.strokeRect(enemySprite.x - FEYLING_IMAGE_SIZE / 2, enemySprite.y - FEYLING_IMAGE_SIZE / 2, FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);

      // Tooltip background
      tooltipBackground = this.add.graphics();
      tooltipBackground.fillStyle(0x000000, 0.7);
      tooltipBackground.fillRect(0, 0, 200, 50);

      // Player Ability image with fixed size
      if (ability?.img) {
        playerAbilitySprite = this.add.image(200, 380, 'ability').setDisplaySize(ABILITY_IMAGE_SIZE, ABILITY_IMAGE_SIZE);
        playerAbilitySprite.setInteractive().on('pointerdown', handleAbility);
        playerAbilitySprite.setInteractive().on('pointerover', () => showTooltip(this, ability, playerAbilitySprite));
        playerAbilitySprite.setInteractive().on('pointerout', hideTooltip);

        // Adding a border around the ability image
        const playerAbilityBorder = this.add.graphics();
        playerAbilityBorder.lineStyle(4, 0x00ff00, 1); // Green border for player ability
        playerAbilityBorder.strokeRect(playerAbilitySprite.x - ABILITY_IMAGE_SIZE / 2, playerAbilitySprite.y - ABILITY_IMAGE_SIZE / 2, ABILITY_IMAGE_SIZE, ABILITY_IMAGE_SIZE);
      }

      // Enemy Ability image with fixed size
      if (enemyAbility?.img) {
        enemyAbilitySprite = this.add.image(800, 380, 'enemyAbility').setDisplaySize(ABILITY_IMAGE_SIZE, ABILITY_IMAGE_SIZE);
        enemyAbilitySprite.setInteractive().on('pointerover', () => showTooltip(this, enemyAbility, enemyAbilitySprite));
        enemyAbilitySprite.setInteractive().on('pointerout', hideTooltip);

        // Adding a border around the enemy ability image
        const enemyAbilityBorder = this.add.graphics();
        enemyAbilityBorder.lineStyle(4, 0xff0000, 1); // Red border for enemy ability
        enemyAbilityBorder.strokeRect(enemyAbilitySprite.x - ABILITY_IMAGE_SIZE / 2, enemyAbilitySprite.y - ABILITY_IMAGE_SIZE / 2, ABILITY_IMAGE_SIZE, ABILITY_IMAGE_SIZE);
      }

      // Ability cooldown texts
      playerAbilityCooldownText = this.add.text(200, 450, '', { fontSize: '16px', color: '#fff' });
      enemyAbilityCooldownText = this.add.text(800, 450, '', { fontSize: '16px', color: '#fff' });

      // Next Turn Button
      nextTurnText = this.add.text(500, 550, 'Next Turn', { fontSize: '32px', color: '#fff' })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', handleNextTurn);

      // Health and TP info
      playerHealthText = this.add.text(50, 20, `HP: ${playerHP}`, { fontSize: '16px', color: '#fff' });
      enemyHealthText = this.add.text(850, 20, `HP: ${enemyHP}`, { fontSize: '16px', color: '#fff' });
      playerTurnPointsText = this.add.text(50, 40, `TP: ${playerTurnPoints}`, { fontSize: '16px', color: '#fff' });
      enemyTurnPointsText = this.add.text(850, 40, `TP: ${enemyTurnPoints}`, { fontSize: '16px', color: '#fff' });

      // Tooltip Text (initially hidden)
      const tooltip = this.add.text(0, 0, tooltipText, { fontSize: '18px', color: '#fff' }).setAlpha(0);

      tooltip.setWordWrapWidth(200);

      // Update tooltip position and visibility in each frame
      this.events.on('update', () => {
        tooltip.setText(tooltipText);
        tooltip.setPosition(tooltipPosition.x, tooltipPosition.y);
        tooltip.setAlpha(tooltipText ? 1 : 0);

        tooltipBackground.setPosition(tooltipPosition.x - 10, tooltipPosition.y - 10);
        tooltipBackground.clear();
        tooltipBackground.fillRect(0, 0, tooltip.width + 20, tooltip.height + 20);
      });

      // Make the player sprite interactive (click to attack)
      playerSprite.setInteractive().on('pointerdown', handleAttack);
    }

    function update(this: Phaser.Scene) {
      playerHealthText.setText(`HP: ${playerHP}`);
      enemyHealthText.setText(`HP: ${enemyHP}`);
      playerTurnPointsText.setText(`TP: ${playerTurnPoints}`);
      enemyTurnPointsText.setText(`TP: ${enemyTurnPoints}`);

      // Check for victory or defeat
      if (enemyHP <= 0 && !victoryHandledRef.current) {
        victoryHandledRef.current = true; // Mark victory as handled
        handleVictory(this);
        return;
      } else if (playerHP <= 0) {
        handleDefeat(this);
        return;
      }

      // The cooldown texts are now updated based on the current state, but not every frame.
      updateAbilityCooldowns();
    }

    function updateAbilityCooldowns() {
      // Update player cooldown text
      if (playerAbilityCooldown > 0) {
        playerAbilityCooldownText.setText(`Cooldown: ${playerAbilityCooldown}`);
      } else {
        playerAbilityCooldownText.setText('Ready');
      }
    
      // Update enemy cooldown text
      if (enemyAbilityCooldown > 0) {
        enemyAbilityCooldownText.setText(`Cooldown: ${enemyAbilityCooldown}`);
      } else {
        enemyAbilityCooldownText.setText('Ready');
      }
    }
    

    function handleAttack() {
      if (turn === 'Player' && playerTurnPoints >= 1) {
        let damage = playerFeyling?.atk ?? 10;
        setEnemyHP((prev) => {
          const newHP = Math.max(prev - damage, 0);
          
          // Check for victory here and trigger the victory handler
          if (newHP <= 0 && !victoryHandledRef.current) {
            victoryHandledRef.current = true; // Mark victory as handled
    
            // Ensure gameInstance.current is not undefined before accessing its scene
            if (gameInstance.current) {
              const currentScene = gameInstance.current.scene.getScene('MainScene'); // Change 'MainScene' to the name of your scene
              if (currentScene) {
                console.log("Victory triggered. Handling victory...");
                handleVictory(currentScene);  // Trigger victory
                // Directly call navigate here without delay for testing
                console.log("Navigating to /gamemenu...");
                navigate('/gamemenu');
              }
            }
          }
        
          return newHP;
        });
        
        setPlayerTurnPoints((prev) => prev - 1);
      }
    }
    
    function handleAbility() {
      if (ability && turn === 'Player' && playerTurnPoints >= 2 && playerAbilityCooldown === 0) {
        const { damage, healthPoint } = ability;
        if (damage > 0) {
          setEnemyHP((prev) => Math.max(prev - damage, 0));
        }
        if (healthPoint > 0) {
          setPlayerHP((prev) => Math.min(prev + healthPoint, playerFeyling?.hp || 100));
        }
        setPlayerAbilityCooldown(ability.rechargeTime || 0); // Set cooldown for the player’s ability
        setPlayerTurnPoints((prev) => prev - 2);
      } else {
        console.log("Ability is on cooldown!");
      }
    }
    
    function handleNextTurn() {
      if (turn === 'Player') {
        setPlayerTurnPoints((prev) => prev + 3);
        setTurn('Enemy');
        if (playerAbilityCooldown > 0) setPlayerAbilityCooldown((prev) => prev - 1);
        enemyTurn();
      }
      
      if (turn === 'Enemy') {
        setEnemyTurnPoints((prev) => prev + 3);
        if (enemyAbilityCooldown > 0) setEnemyAbilityCooldown((prev) => prev - 1);
      }
    }
    
    function enemyTurn() {
      setEnemyTurnPoints((prev) => {
        let newEnemyTurnPoints = prev;
        if (enemyFeyling && newEnemyTurnPoints >= 2 && enemyAbilityCooldown === 0 && enemyAbility) {
          const { damage, healthPoint } = enemyAbility; // Use enemy's ability
    
          if (damage > 0) {
            setPlayerHP((prev) => Math.max(prev - damage, 0));
          }
          if (healthPoint > 0) {
            setEnemyHP((prev) => Math.min(prev + healthPoint, enemyFeyling.hp || 100));
          }
    
          setEnemyAbilityCooldown(enemyAbility.rechargeTime || 0); // Set the cooldown for the enemy ability
          newEnemyTurnPoints -= 2;  // Decrement by 2 for using an ability
          console.log('Enemy used ability!');
        }
    
        while (newEnemyTurnPoints > 0 && enemyFeyling) {
          const damage = enemyFeyling.atk;
          setPlayerHP((prev) => Math.max(prev - damage, 0));
          newEnemyTurnPoints -= 1;  // Decrement by 1 for attacking
          console.log('Enemy attacked!');
          if (newEnemyTurnPoints <= 0) {
            break;
          }
        }
    
        console.log('Updated Enemy Turn Points after attack/ability:', newEnemyTurnPoints);
        return newEnemyTurnPoints;  // Return the updated value to React
      });
    
      console.log('Enemy Turn Points at the start of enemyTurn():', enemyTurnPoints);
    }
    

    async function handleVictory(scene: Phaser.Scene) {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.sub;
    
      if (!userId) {
        console.error('User ID is missing or invalid');
        return;
      }
    
      await updateUserOnVictory(userId, 1, 200);
    
      // Update localStorage only once after victory
      userData['CoinAmount'] = (parseInt(userData['CoinAmount'] || '0') + 200).toString();
      userData['User Level'] = (parseInt(userData['User Level'] || '1') + 1).toString();
      localStorage.setItem('userData', JSON.stringify(userData));
    
      const victoryText = scene.add.text(500, 300, 'You Win!', { fontSize: '32px', color: '#00ff00' }).setOrigin(0.5);
      scene.tweens.add({
        targets: victoryText,
        alpha: 0,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          victoryText.destroy();
          navigate('/gamemenu');
        },
      });
    
      scene.time.delayedCall(2000, () => {
        victoryText.setAlpha(0);
        navigate('/gamemenu');
      });
    }
    
    
    function handleDefeat(scene: Phaser.Scene) {
      // Show defeat text
      const defeatText = scene.add.text(500, 300, 'You Lose!', { fontSize: '32px', color: '#ff0000' }).setOrigin(0.5);
      defeatText.setAlpha(1);
      scene.tweens.add({
        targets: defeatText,
        alpha: 0,
        duration: 1000,
        ease: 'Linear',
        onComplete: () => {
          defeatText.destroy();
          navigate('/gamemenu');
        },
      });
    
      // Delay and fade out the defeat text, then navigate
      scene.time.delayedCall(2000, () => {
        defeatText.setAlpha(0);
        navigate('/gamemenu');
      });
    }

    function showTooltip(scene: Phaser.Scene, item: Ability | Feyling, sprite: Phaser.GameObjects.Image) {
      const text = `${item?.name || 'No Name'}: ${item?.description || 'No Description'}`;
      const x = sprite.x;
      const y = sprite.y - sprite.height / 2 - 20;
      setTooltipText(text);
      setTooltipPosition({ x, y });
    }

    function hideTooltip() {
      setTooltipText('');
    }

    return () => {
      gameInstance.current?.destroy(true);
      gameInstance.current = null;
    };
  }, [turn, enemyHP, playerHP, playerFeyling, enemyFeyling, playerTurnPoints, enemyTurnPoints, tooltipText, tooltipPosition, playerAbilityCooldown, enemyAbilityCooldown]);

  if (loading) {
    return <p>Loading Feylings...</p>;
  }

  return (
    <>
      <Header/>
      <div className={styles.gameWrapper} ref={gameRef}/>
    </>
  );
};

export default Game;
