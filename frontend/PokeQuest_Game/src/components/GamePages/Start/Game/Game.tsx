import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useFeyling } from '../../../../context/FeylingContext';
import styles from './Game.module.css';
import { GetAllAbility, GetAllFeylings } from '../../../../services/ApiServices';
import { Feyling } from '../../../../types/Feyling';
import { Ability } from '../../../../types/Ability';

const Game: React.FC = () => {
  const gameRef = useRef<HTMLDivElement | null>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const { selectedFeyling } = useFeyling();
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

    function update() {
      playerHealthText.setText(`HP: ${playerHP}`);
      enemyHealthText.setText(`HP: ${enemyHP}`);
      playerTurnPointsText.setText(`TP: ${playerTurnPoints}`);
      enemyTurnPointsText.setText(`TP: ${enemyTurnPoints}`);

      // The cooldown texts are now updated based on the current state, but not every frame.
      updateAbilityCooldowns();
    }

    function updateAbilityCooldowns() {
      // Only update cooldown texts when the next turn button is clicked.
      if (playerAbilityCooldown > 0) {
        playerAbilityCooldownText.setText(`Cooldown: ${playerAbilityCooldown}`);
      } else {
        playerAbilityCooldownText.setText('Ready');
      }

      if (enemyAbilityCooldown > 0) {
        enemyAbilityCooldownText.setText(`Cooldown: ${enemyAbilityCooldown}`);
      } else {
        enemyAbilityCooldownText.setText('Ready');
      }
    }

    function handleAttack() {
      if (turn === 'Player' && playerTurnPoints >= 1) {
        let damage = Math.floor(Math.random() * (playerFeyling?.atk || 10)) + 5;
        setEnemyHP((prev) => Math.max(prev - damage, 0));
        setPlayerTurnPoints((prev) => prev - 1);
      }
    }

    function handleAbility() {
      if (ability && turn === 'Player' && playerTurnPoints >= 2 && playerAbilityCooldown === 0) {
        const { damage, healthPoint } = ability;
        if (damage > 0) {
          setEnemyHP((prev) => Math.max(prev - damage, 0));
        } else if (healthPoint > 0) {
          setPlayerHP((prev) => Math.min(prev + healthPoint, playerFeyling?.hp || 100));
        }
        setPlayerAbilityCooldown(ability.rechargeTime || 0); // Set cooldown for the ability
        setPlayerTurnPoints((prev) => prev - 2);
      } else {
        console.log("Ability is on cooldown!");
      }
    }

    function handleNextTurn() {
      if (turn === 'Player') {
        setPlayerTurnPoints((prev) => prev + 3);
        setEnemyTurnPoints((prev) => prev + 3);
        setTurn('Enemy');

        // Decrease cooldowns for both player and enemy on the next turn.
        if (playerAbilityCooldown > 0) setPlayerAbilityCooldown((prev) => prev - 1);
        if (enemyAbilityCooldown > 0) setEnemyAbilityCooldown((prev) => prev - 1);

        setTimeout(enemyTurn, 1000);
      }
    }

    function enemyTurn() {
      if (enemyTurnPoints >= 1 && enemyFeyling) {
        const damage = Math.floor(Math.random() * (enemyFeyling?.atk || 10)) + 5;
        setPlayerHP((prev) => Math.max(prev - damage, 0));
        setEnemyTurnPoints((prev) => prev - 1);
        setTurn('Player');
      } else {
        setTurn('Player');
      }
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
    <div className={styles.gameWrapper} ref={gameRef}></div>
  );
};

export default Game;
