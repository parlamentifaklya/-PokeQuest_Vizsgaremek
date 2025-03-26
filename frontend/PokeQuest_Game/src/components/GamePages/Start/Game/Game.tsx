import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useFeyling } from '../../../../context/FeylingContext';
import styles from './Game.module.css';
import { GetAllAbility, GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';
import { Ability } from '../../../../types/Ability';
import { useNavigate } from 'react-router-dom';
import { updateUserOnVictory } from '../../../../services/ApiServices';
import Header from '../../../../modules/Header';
import { toast, ToastContainer } from 'react-toastify';

// Constants
const FEYLING_IMAGE_SIZE = 200;
const ABILITY_IMAGE_SIZE = 75;

// Helper function to convert FeylingsFromLocalStorage to Feyling type
const convertToFeyling = (feylingFromStorage: any): Feyling => ({
  id: feylingFromStorage.feylingId,
  name: feylingFromStorage.feylingName,
  description: feylingFromStorage.feylingDescription,
  img: feylingFromStorage.feylingImg,
  typeId: feylingFromStorage.feylingType,
  abilityId: feylingFromStorage.feylingAbility,
  isUnlocked: feylingFromStorage.feylingIsUnlocked,
  hp: feylingFromStorage.feylingHp,
  atk: feylingFromStorage.feylingAtk,
  weakAgainstId: feylingFromStorage.feylingWeakAgainst,
  strongAgainstId: feylingFromStorage.feylingStrongAgainst,
  itemId: feylingFromStorage.Item,
  sellPrice: feylingFromStorage.feylingSellPrice
});

// Game Scene Class
class GameScene extends Phaser.Scene {
  private gameLogic: GameLogic;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private playerAbilitySprite!: Phaser.GameObjects.Image;
  private enemyAbilitySprite!: Phaser.GameObjects.Image;
  private nextTurnText!: Phaser.GameObjects.Text;
  private playerHealthText!: Phaser.GameObjects.Text;
  private enemyHealthText!: Phaser.GameObjects.Text;
  private playerTurnPointsText!: Phaser.GameObjects.Text;
  private enemyTurnPointsText!: Phaser.GameObjects.Text;
  private tooltipBackground!: Phaser.GameObjects.Graphics;
  private playerAbilityCooldownText!: Phaser.GameObjects.Text;
  private enemyAbilityCooldownText!: Phaser.GameObjects.Text;
  private playerDamageText!: Phaser.GameObjects.Text;
  private enemyDamageText!: Phaser.GameObjects.Text;
  private tooltipText!: Phaser.GameObjects.Text;

  constructor(gameLogic: GameLogic) {
    super('GameScene');
    this.gameLogic = gameLogic;
  }

  preload() {
    this.load.image('background', 'bg.png');
    
    // Load player assets
    this.load.image('player', this.gameLogic.playerFeyling?.img || 'defaultImage.png');
    if (this.gameLogic.ability?.img) {
      this.load.image('ability', this.gameLogic.ability.img);
    } else {
      this.load.image('ability', 'defaultAbilityImage.png');
    }
    
    // Load enemy assets
    this.load.image('enemy', this.gameLogic.enemyFeyling?.img || 'defaultEnemyImg.png');
    if (this.gameLogic.enemyAbility?.img) {
      this.load.image('enemyAbility', this.gameLogic.enemyAbility.img);
    } else {
      this.load.image('enemyAbility', 'defaultAbilityImage.png');
    }
  }

  create() {
    // Background
    this.add.image(500, 300, 'background').setDisplaySize(1000, 600);

    // Player and Enemy sprites
    this.playerSprite = this.add.image(200, 300, 'player').setDisplaySize(FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);
    this.enemySprite = this.add.image(800, 300, 'enemy').setDisplaySize(FEYLING_IMAGE_SIZE, FEYLING_IMAGE_SIZE);

    // Add borders
    this.addBorder(this.playerSprite, 0x00ff00);
    this.addBorder(this.enemySprite, 0xff0000);

    // Tooltip setup
    this.tooltipBackground = this.add.graphics();
    this.tooltipText = this.add.text(0, 0, '', { 
      fontSize: '18px', 
      color: '#fff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setAlpha(0);
    this.tooltipText.setWordWrapWidth(200);

    // Setup ability sprites
    this.setupAbilitySprite(true);  // Player ability
    this.setupAbilitySprite(false); // Enemy ability

    // Create UI elements
    this.createUIElements();
    
    // Make player sprite interactive
    this.playerSprite.setInteractive().on('pointerdown', () => this.gameLogic.handleAttack());

    // Update loop
    this.events.on('update', this.update.bind(this));
  }

  private addBorder(sprite: Phaser.GameObjects.Image, color: number) {
    const border = this.add.graphics();
    border.lineStyle(4, color, 1);
    border.strokeRect(
      sprite.x - sprite.displayWidth / 2,
      sprite.y - sprite.displayHeight / 2,
      sprite.displayWidth,
      sprite.displayHeight
    );
  }

  private setupAbilitySprite(isPlayer: boolean) {
    const abilityData = isPlayer ? this.gameLogic.ability : this.gameLogic.enemyAbility;
    const xPos = isPlayer ? 200 : 800;
    const color = isPlayer ? 0x00ff00 : 0xff0000;
    const abilityKey = isPlayer ? 'ability' : 'enemyAbility';

    const abilitySprite = this.add.image(xPos, 380, abilityKey)
      .setDisplaySize(ABILITY_IMAGE_SIZE, ABILITY_IMAGE_SIZE)
      .setInteractive();

    // Add border
    const border = this.add.graphics();
    border.lineStyle(4, color, 1);
    border.strokeRect(
      abilitySprite.x - ABILITY_IMAGE_SIZE / 2,
      abilitySprite.y - ABILITY_IMAGE_SIZE / 2,
      ABILITY_IMAGE_SIZE,
      ABILITY_IMAGE_SIZE
    );

    // Set up interactivity
    if (isPlayer) {
      this.playerAbilitySprite = abilitySprite;
      abilitySprite
        .on('pointerdown', () => this.gameLogic.handleAbility())
        .on('pointerover', () => {
          if (abilityData) this.showTooltip(abilityData, abilitySprite);
        })
        .on('pointerout', () => this.hideTooltip());
    } else {
      this.enemyAbilitySprite = abilitySprite;
      abilitySprite
        .on('pointerover', () => {
          if (abilityData) this.showTooltip(abilityData, abilitySprite);
        })
        .on('pointerout', () => this.hideTooltip());
    }

    // Add cooldown text
    const cooldownText = this.add.text(xPos, 450, '', { 
      fontSize: '16px', 
      color: '#fff',
      backgroundColor: '#000000'
    }).setOrigin(0.5);
    
    if (isPlayer) {
      this.playerAbilityCooldownText = cooldownText;
    } else {
      this.enemyAbilityCooldownText = cooldownText;
    }
  }

  private createUIElements() {
    // Next turn button
    this.nextTurnText = this.add.text(500, 550, 'End Turn', { 
      fontSize: '32px', 
      color: '#fff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5)
    .setInteractive()
    .on('pointerdown', () => this.gameLogic.handleNextTurn());

    // Health and turn points displays
    this.playerHealthText = this.add.text(50, 20, `HP: ${this.gameLogic.playerHP}`, { 
      fontSize: '24px', 
      color: '#fff',
      backgroundColor: '#000000'
    });
    
    this.enemyHealthText = this.add.text(850, 20, `HP: ${this.gameLogic.enemyHP}`, { 
      fontSize: '24px', 
      color: '#fff',
      backgroundColor: '#000000'
    }).setOrigin(1, 0);
    
    this.playerTurnPointsText = this.add.text(50, 50, `TP: ${this.gameLogic.playerTurnPoints}`, { 
      fontSize: '20px', 
      color: '#fff',
      backgroundColor: '#000000'
    });
    
    this.enemyTurnPointsText = this.add.text(850, 50, `TP: ${this.gameLogic.enemyTurnPoints}`, { 
      fontSize: '20px', 
      color: '#fff',
      backgroundColor: '#000000'
    }).setOrigin(1, 0);

    // Damage texts
    this.playerDamageText = this.add.text(50, 80, '', { 
      fontSize: '20px', 
      color: this.gameLogic.playerDamageTextColor,
      backgroundColor: '#000000'
    });
    
    this.enemyDamageText = this.add.text(850, 80, '', { 
      fontSize: '20px', 
      color: this.gameLogic.enemyDamageTextColor,
      backgroundColor: '#000000'
    }).setOrigin(1, 0);
  }

  private showTooltip(item: Ability | Feyling, sprite: Phaser.GameObjects.Image) {
    const text = `${item.name}\n\n${item.description}`;
    const x = sprite.x;
    const y = sprite.y - sprite.displayHeight / 2 - 10;
    
    this.tooltipText.setText(text);
    this.tooltipText.setPosition(x - this.tooltipText.width / 2, y - this.tooltipText.height);
    this.tooltipText.setAlpha(1);
  }

  private hideTooltip() {
    this.tooltipText.setAlpha(0);
  }

  update() {
    // Update health and turn points
    this.playerHealthText.setText(`HP: ${this.gameLogic.playerHP}`);
    this.enemyHealthText.setText(`HP: ${this.gameLogic.enemyHP}`);
    this.playerTurnPointsText.setText(`TP: ${this.gameLogic.playerTurnPoints}`);
    this.enemyTurnPointsText.setText(`TP: ${this.gameLogic.enemyTurnPoints}`);
    
    // Update damage texts
    if (this.gameLogic.playerDamageTextVisible) {
      this.playerDamageText.setText(this.gameLogic.playerDamageTextToShow)
        .setColor(this.gameLogic.playerDamageTextColor)
        .setAlpha(1);
    } else {
      this.playerDamageText.setAlpha(0);
    }
    
    if (this.gameLogic.enemyDamageTextVisible) {
      this.enemyDamageText.setText(this.gameLogic.enemyDamageTextToShow)
        .setColor(this.gameLogic.enemyDamageTextColor)
        .setAlpha(1);
    } else {
      this.enemyDamageText.setAlpha(0);
    }

    // Update next turn button visibility
    this.nextTurnText.setVisible(
      this.gameLogic.turn === 'Player' && 
      this.gameLogic.playerTurnPoints <= 0 &&
      this.gameLogic.playerHP > 0 &&
      this.gameLogic.enemyHP > 0
    );

    // Update ability cooldowns
    this.playerAbilityCooldownText.setText(
      this.gameLogic.playerAbilityCooldown > 0 ? 
      `Cooldown: ${this.gameLogic.playerAbilityCooldown}` : 'Ready!'
    );
    
    this.enemyAbilityCooldownText.setText(
      this.gameLogic.enemyAbilityCooldown > 0 ? 
      `Cooldown: ${this.gameLogic.enemyAbilityCooldown}` : 'Ready!'
    );

    // Check for game end
    if (this.gameLogic.checkGameEnd()) {
      this.playerSprite.disableInteractive();
      if (this.playerAbilitySprite) this.playerAbilitySprite.disableInteractive();
      this.nextTurnText.disableInteractive();
    }
  }
}

// Game Logic Class
class GameLogic {
  // Game state
  turn: 'Player' | 'Enemy' = 'Player';
  playerHP = 0;
  enemyHP = 0;
  playerTurnPoints = 4;
  enemyTurnPoints = 3;
  playerAbilityCooldown = 0;
  enemyAbilityCooldown = 0;
  playerDamageTextToShow = '';
  enemyDamageTextToShow = '';
  playerDamageTextColor = '#ffffff';
  enemyDamageTextColor = '#ffffff';
  playerDamageTextVisible = false;
  enemyDamageTextVisible = false;
  victoryHandled = false;
  toastShown = false;

  // Game entities
  playerFeyling: Feyling | null = null;
  enemyFeyling: Feyling | null = null;
  abilities: Ability[] = [];
  ability: Ability | null = null;
  enemyAbility: Ability | null = null;

  // Dependencies
  private navigate: (path: string) => void;
  private showToast: (type: 'success' | 'error', message: string) => void;

  constructor(
    initialPlayerFeyling: Feyling | null,
    navigate: (path: string) => void,
    showToast: (type: 'success' | 'error', message: string) => void
  ) {
    this.playerFeyling = initialPlayerFeyling;
    this.playerHP = initialPlayerFeyling?.hp || 100;
    this.navigate = navigate;
    this.showToast = showToast;
  }

  initialize(playerFeyling: Feyling, enemyFeyling: Feyling, abilities: Ability[]) {
    console.log('Initializing game with:', { playerFeyling, enemyFeyling });
    
    this.playerFeyling = playerFeyling;
    this.enemyFeyling = enemyFeyling;
    this.abilities = abilities;
    
    // Set abilities based on the feylings' ability IDs
    this.ability = this.getAbilityById(playerFeyling.abilityId);
    this.enemyAbility = this.getAbilityById(enemyFeyling.abilityId);
    
    console.log('Player ability:', this.ability);
    console.log('Enemy ability:', this.enemyAbility);
    
    // Set initial HP based on feylings' stats
    this.playerHP = playerFeyling.hp;
    this.enemyHP = enemyFeyling.hp;
    
    // Reset game state
    this.turn = 'Player';
    this.playerTurnPoints = 4;
    this.enemyTurnPoints = 3;
    this.playerAbilityCooldown = 0;
    this.enemyAbilityCooldown = 0;
    this.victoryHandled = false;
    this.toastShown = false;
  }

  private getAbilityById(abilityId: number | undefined): Ability | null {
    if (!abilityId) return null;
    
    // Convert abilityId to number if it's a string
    const id = typeof abilityId === 'string' ? parseInt(abilityId) : abilityId;
    
    // Find the ability with matching ID
    const foundAbility = this.abilities.find(ability => {
      // Ensure we're comparing numbers to numbers
      const abilityIdNum = typeof ability.id === 'string' ? parseInt(ability.id) : ability.id;
      return abilityIdNum === id;
    });

    console.log(`Looking for ability ${id} (type: ${typeof id}), found:`, foundAbility);
    return foundAbility || null;
  }

  handleAttack() {
    if (this.turn !== 'Player' || this.playerTurnPoints < 1 || this.enemyHP <= 0 || this.playerHP <= 0) return;

    const damage = this.playerFeyling?.atk || 10;
    this.enemyHP = Math.max(this.enemyHP - damage, 0);
    
    this.enemyDamageTextToShow = `-${damage}`;
    this.enemyDamageTextColor = '#ff0000';
    this.playerTurnPoints -= 1;
    this.enemyDamageTextVisible = true;

    setTimeout(() => {
      this.enemyDamageTextVisible = false;
    }, 1000);

    this.checkGameEnd();
  }

  handleAbility() {
    if (!this.ability || this.turn !== 'Player' || this.playerTurnPoints < 2 || 
        this.playerAbilityCooldown > 0 || this.enemyHP <= 0 || this.playerHP <= 0) {
      return;
    }

    const { damage, healthPoint } = this.ability;

    if (healthPoint > 0) {
      this.playerHP = Math.min(this.playerHP + healthPoint, this.playerFeyling?.hp || 100);
      this.playerDamageTextToShow = `+${healthPoint}`;
      this.playerDamageTextColor = '#00ff00';
      this.playerDamageTextVisible = true;
    }

    if (damage > 0) {
      this.enemyHP = Math.max(this.enemyHP - damage, 0);
      this.enemyDamageTextToShow = `-${damage}`;
      this.enemyDamageTextColor = '#ff0000';
      this.enemyDamageTextVisible = true;
    }

    this.playerAbilityCooldown = this.ability.rechargeTime || 0;
    this.playerTurnPoints -= 2;

    setTimeout(() => {
      this.playerDamageTextVisible = false;
      this.enemyDamageTextVisible = false;
    }, 1000);

    this.checkGameEnd();
  }

  handleNextTurn() {
    if (this.turn === 'Player' && this.playerTurnPoints <= 0 && this.enemyHP > 0 && this.playerHP > 0) {
      this.turn = 'Enemy';
      
      if (this.playerAbilityCooldown > 0) {
        this.playerAbilityCooldown -= 1;
      }

      this.enemyTurn();
    }
  }

  enemyTurn() {
    if (this.enemyHP <= 0 || this.playerHP <= 0) return;

    let pointsLeft = this.enemyTurnPoints;
    
    // Enemy ability
    if (pointsLeft >= 2 && this.enemyAbilityCooldown === 0 && this.enemyAbility) {
      const { damage, healthPoint } = this.enemyAbility;
      
      console.log('Enemy using ability:', this.enemyAbility);
      
      if (damage > 0) {
        this.playerHP = Math.max(this.playerHP - damage, 0);
        this.playerDamageTextToShow = `-${damage}`;
        this.playerDamageTextColor = '#ff0000';
        this.playerDamageTextVisible = true;
      }
      
      if (healthPoint > 0) {
        this.enemyHP = Math.min(this.enemyHP + healthPoint, this.enemyFeyling?.hp || 100);
        this.enemyDamageTextToShow = `+${healthPoint}`;
        this.enemyDamageTextColor = '#00ff00';
        this.enemyDamageTextVisible = true;
      }
      
      this.enemyAbilityCooldown = this.enemyAbility.rechargeTime || 0;
      pointsLeft -= 2;
    }
    
    // Enemy attacks
    while (pointsLeft > 0 && this.playerHP > 0) {
      const damage = this.enemyFeyling?.atk || 10;
      this.playerHP = Math.max(this.playerHP - damage, 0);
      this.playerDamageTextToShow = `-${damage}`;
      this.playerDamageTextColor = '#ff0000';
      this.playerDamageTextVisible = true;
      pointsLeft -= 1;
    }
    
    setTimeout(() => {
      this.playerDamageTextVisible = false;
      this.enemyDamageTextVisible = false;
    }, 1000);

    // Reset for player turn
    this.enemyTurnPoints = 3;
    this.playerTurnPoints = 4;
    this.turn = 'Player';
    
    // Update cooldowns
    if (this.enemyAbilityCooldown > 0) {
      this.enemyAbilityCooldown -= 1;
    }
    if (this.playerAbilityCooldown > 0) {
      this.playerAbilityCooldown -= 1;
    }

    this.checkGameEnd();
  }

  async handleVictory() {
    if (this.victoryHandled) return;
    this.victoryHandled = true;

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData.sub;

    if (!userId) {
      console.error('User ID is missing or invalid');
      return;
    }

    userData['CoinAmount'] = (parseInt(userData['CoinAmount'] || '0') + 200).toString();
    userData['User Level'] = (parseInt(userData['User Level'] || '1') + 1).toString();
    localStorage.setItem('userData', JSON.stringify(userData));

    this.showToast('success', 'You Win! +1 level +200 gem 🎉');
    await updateUserOnVictory(userId, 1, 200);
  }

  handleDefeat() {
    if (this.toastShown) return;
    this.toastShown = true;
    this.showToast('error', 'You Lose!');
  }

  checkGameEnd(): boolean {
    if (this.enemyHP <= 0 && !this.victoryHandled) {
      this.handleVictory();
      return true;
    } else if (this.playerHP <= 0 && !this.toastShown) {
      this.handleDefeat();
      return true;
    }
    return false;
  }
}

// Main Game Component
const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const gameLogicRef = useRef<GameLogic | null>(null);
  const { selectedFeyling } = useFeyling();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize game logic
  useEffect(() => {
    const initialPlayerFeyling = selectedFeyling ? convertToFeyling(selectedFeyling) : null;
    
    gameLogicRef.current = new GameLogic(
      initialPlayerFeyling,
      navigate,
      (type, message) => {
        if (type === 'success') {
          toast.success(message, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            onClose: () => navigate('/gamemenu')
          });
        } else {
          toast.error(message, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            onClose: () => navigate('/gamemenu')
          });
        }
      }
    );
  }, [navigate, selectedFeyling]);

  // Fetch game data
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const [abilities, feylings] = await Promise.all([
          GetAllAbility(),
          GetAllFeylings()
        ]);

        if (feylings.length > 0) {
          const playerFeyling = selectedFeyling?.feylingId 
            ? feylings.find(f => f.id === selectedFeyling.feylingId)
            : null;
          
          // Filter out the player's feyling from potential enemies
          const potentialEnemies = feylings.filter(f => f.id !== selectedFeyling?.feylingId);
          const enemyFeyling = potentialEnemies[Math.floor(Math.random() * potentialEnemies.length)];

          console.log('Selected enemy:', enemyFeyling);

          if (playerFeyling && enemyFeyling && gameLogicRef.current) {
            gameLogicRef.current.initialize(playerFeyling, enemyFeyling, abilities);
          }
        }
      } catch (error) {
        console.error('Failed to fetch game data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [selectedFeyling]);

  // Initialize Phaser game
  useEffect(() => {
    if (!gameRef.current || !gameLogicRef.current || loading) return;

    if (gameInstance.current) {
      gameInstance.current.destroy(true);
      gameInstance.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1000,
      height: 600,
      parent: gameRef.current,
      scene: [new GameScene(gameLogicRef.current)],
      backgroundColor: '#000000'
    };

    gameInstance.current = new Phaser.Game(config);

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, [loading]);

  if (loading) {
    return <p>Loading game...</p>;
  }

  return (
    <>
      <Header />
      <div className={styles.gameWrapper} ref={gameRef} />
      <ToastContainer />
    </>
  );
};

export default Game;