
import * as PIXI from 'pixi.js';
import { ImageLoader } from '../utils/ImageLoader';

interface ChatMessage {
  name: string;
  text: string;
}

interface Avatar {
  name: string;
  url: string;
  position: 'left' | 'right';
}

interface Emoji {
  name: string;
  url: string;
}

interface ChatData {
  dialogue: ChatMessage[];
  emojies: Emoji[];
  avatars: Avatar[];
}

export class MagicWordsScene {
  public view = new PIXI.Container();
  private app: PIXI.Application;
  private chatData: ChatData | null = null;
  private avatarTextures: Record<string, PIXI.Texture> = {};
  private emojiTextures: Record<string, PIXI.Texture> = {};
  private chatMessages: PIXI.Container[] = [];
  private chatContainer: PIXI.Container | null = null;
  private scrollContainer: PIXI.Container | null = null;
  private bg!: PIXI.Graphics;
  // Mobile responsive properties
  private get isMobile() {
    return window.innerWidth < 768;
  }

  constructor(app: PIXI.Application) {
    this.app = app;
    this.build();
  }

  private async build() {
    // Create chat room background
    this.createChatBackground();
    
    // Fetch chat data from API
    await this.fetchChatData();
    
    // Load avatars and emojis
    await this.loadAssets();
    
    // Render the chat messages
    this.renderChatMessages();
  }

  private createChatBackground() {
    this.bg = new PIXI.Graphics();
    this.view.addChild(this.bg);
    this.drawChatBackground(); // initial draw
  
    // Listen for resize from PixiApp’s ticker or resize event
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.drawChatBackground();
    });
  }
  
  private drawChatBackground() {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
  
    // Clear any previous graphics
    this.bg.clear();
  
    // Main rectangle
    this.bg.beginFill(0x0f172a, 0.95);
    this.bg.drawRoundedRect(0, 0, width, height, 0);
    this.bg.endFill();
  
    // Subtle pattern overlay
    this.bg.beginFill(0x1e293b, 0.3);
    for (let i = 0; i < width; i += 40) {
      for (let j = 0; j < height; j += 40) {
        this.bg.drawCircle(i, j, 1);
      }
    }
    this.bg.endFill();
  }

  private async fetchChatData() {
    try {
      const resp = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
      if (!resp.ok) throw new Error('Bad response');
      this.chatData = await resp.json();
    } catch (e) {      
      // Fallback data
      this.chatData = {
        dialogue: [
          { name: "Sheldon", text: "I admit {satisfied} the design of Cookie Crush is quite elegant in its simplicity." },
          { name: "Leonard", text: "That's practically a compliment, Sheldon. {intrigued} Are you feeling okay?" },
          { name: "Penny", text: "Don't worry, Leonard. He's probably just trying to justify playing it himself. {laughing}" },
          { name: "Sheldon", text: "Actually, the mathematical probability of success in this game is fascinating." },
          { name: "Penny", text: "Here we go again... {neutral}" },
          { name: "Leonard", text: "Sheldon, we're just trying to have fun, not solve quantum mechanics. {sad}" }
        ],
        emojies: [
          { name: "sad", url: "https://api.dicebear.com/9.x/fun-emoji/png?seed=Sad" },
          { name: "intrigued", url: "https://api.dicebear.com/9.x/fun-emoji/png?seed=Sawyer" },
          { name: "neutral", url: "https://api.dicebear.com/9.x/fun-emoji/png?seed=Destiny" },
          { name: "satisfied", url: "https://api.dicebear.com/9.x/fun-emoji/png?seed=Jocelyn" },
          { name: "laughing", url: "https://api.dicebear.com/9.x/fun-emoji/png?seed=Sophia" }
        ],
        avatars: [
          { name: "Sheldon", url: "https://api.dicebear.com/9.x/personas/png?body=squared&clothingColor=6dbb58&eyes=open&hair=buzzcut&hairColor=6c4545&mouth=smirk&nose=smallRound&skinColor=e5a07e", position: "left" },
          { name: "Penny", url: "https://api.dicebear.com/9.x/personas/png?body=squared&clothingColor=f55d81&eyes=happy&hair=extraLong&hairColor=f29c65&mouth=smile&nose=smallRound&skinColor=e5a07e", position: "right" },
          { name: "Leonard", url: "https://api.dicebear.com/9.x/personas/png?body=checkered&clothingColor=f3b63a&eyes=glasses&hair=shortCombover&hairColor=362c47&mouth=surprise&nose=mediumRound&skinColor=d78774", position: "left" }
        ]
      };
    }
  }

  private async loadAssets() {
    if (!this.chatData) return;
    // Load avatar textures
    for (const avatar of this.chatData.avatars) {
      try {
        const texture = await ImageLoader.loadTexture(avatar.url);
        this.avatarTextures[avatar.name] = texture;
      } catch (e) {
        console.warn(`Failed to load avatar for ${avatar.name}:`, e);
      }
    }

    // Load emoji textures
    for (const emoji of this.chatData.emojies) {
      try {
        const texture = await ImageLoader.loadTexture(emoji.url);
        this.emojiTextures[emoji.name] = texture;
      } catch (e) {
        // Create a fallback texture for missing emojis
        this.createFallbackEmojiTexture(emoji.name);
      }
    }

    this.emojiTextures["win"] = await ImageLoader.loadTexture("https://api.dicebear.com/9.x/fun-emoji/png?seed=win");
    this.emojiTextures["affirmative"] = await ImageLoader.loadTexture("https://api.dicebear.com/9.x/fun-emoji/png?seed=affirmative");
    this.avatarTextures["Neighbour"] = await ImageLoader.loadTexture("https://api.dicebear.com/9.x/personas/png?body=squared&clothingColor=ffbb58&eyes=glasses&hair=buzzcut&hairColor=6c4545&mouth=smirk&nose=smallRound&skinColor=e5a07e");
  }

  private createFallbackEmojiTexture(emojiName: string) {
    // Create a simple colored circle as fallback emoji
    const graphics = new PIXI.Graphics();
    const color = this.getEmojiFallbackColor(emojiName);
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, 12);
    graphics.endFill();
    
    // Add text for the emoji name
    const text = new PIXI.Text(emojiName.substring(0, 2), {
      fontSize: 10,
      fill: 0xffffff,
      fontFamily: 'Arial'
    });
    text.anchor.set(0.5);
    
    const container = new PIXI.Container();
    container.addChild(graphics);
    container.addChild(text);
    
    // Generate texture from container
    const texture = this.app.renderer.generateTexture(container);
    this.emojiTextures[emojiName] = texture;
  }

  private getEmojiFallbackColor(emojiName: string): number {
    const colors: Record<string, number> = {
      'neutral': 0x9ca3af,
      'thinking': 0x3b82f6,
      'happy': 0x10b981,
      'satisfied': 0xf59e0b,
      'intrigued': 0x8b5cf6
    };
    return colors[emojiName] || 0x6b7280;
  }

  private renderChatMessages() {
    if (!this.chatData) return;

    // Create scroll container
    this.scrollContainer = new PIXI.Container();
    this.scrollContainer.x = 0;
    this.scrollContainer.y = 0;
    this.view.addChild(this.scrollContainer);

    // Create chat container inside scroll container
    this.chatContainer = new PIXI.Container();
    this.chatContainer.x = 0;
    this.chatContainer.y = 0;
    this.chatContainer.pivot.set(0, 0);
    this.scrollContainer.addChild(this.chatContainer);

    const maxWidth = this.isMobile ? this.app.renderer.width * 0.9 : Math.min(this.app.renderer.width * 0.8, 800);
    const avatarSize = this.isMobile ? 40 : 50;
    const messagePadding = this.isMobile ? 12 : 16;
    let currentY = 20; // Start higher on screen

    // Create message containers first
    const messageContainers: PIXI.Container[] = [];
    for (const message of this.chatData.dialogue) {
      const messageContainer = this.createMessageBubble(message, maxWidth, avatarSize, messagePadding);
      messageContainer.x = 0; // Ensure x position is 0
      messageContainer.y = currentY;
      messageContainer.alpha = 0;
      messageContainer.scale.set(0.8);
      this.chatContainer.addChild(messageContainer);
      
      currentY += messageContainer.height + 20; // More spacing between messages
      messageContainers.push(messageContainer);
    }

    // Center the chat container horizontally
    this.chatContainer.x = (this.app.renderer.width - maxWidth) / 2;
    this.chatContainer.y = 0; // Start at top of scroll container


    
    // Animate messages appearing sequentially
    this.animateMessagesSequentially(messageContainers);
  }


  private createMessageBubble(message: ChatMessage, maxWidth: number, avatarSize: number, padding: number): PIXI.Container {
    const container = new PIXI.Container();
    const avatar = this.chatData?.avatars.find(a => a.name === message.name);
    
    // Determine position based on speaker - alternate between left and right for variety
    const messageIndex = this.chatData?.dialogue.findIndex(m => m === message) || 0;
    const isLeft = messageIndex % 2 === 0; // Alternate positioning
    
    // Parse message text with emojis
    const textParts = this.parseMessageText(message.text);
    
    // Create avatar
    let avatarSprite: PIXI.Sprite | null = null;
    
    if ((avatar && this.avatarTextures[avatar.name]) || message?.name == "Neighbour") {
      const avatarName = avatar?.name || "Neighbour";
      avatarSprite = new PIXI.Sprite(this.avatarTextures[avatarName]);
      avatarSprite.width = avatarSize;
      avatarSprite.height = avatarSize;
      avatarSprite.anchor.set(0.5);
      
      // Add avatar border
      const avatarBorder = new PIXI.Graphics();
      avatarBorder.beginFill(0x3b82f6);
      avatarBorder.drawCircle(0, 0, avatarSize / 2 + 3);
      avatarBorder.endFill();
      avatarBorder.beginFill(0x1e293b);
      avatarBorder.drawCircle(0, 0, avatarSize / 2 + 1);
      avatarBorder.endFill();
      
      if (isLeft) {
        avatarBorder.x = avatarSize / 2 + 10;
        avatarSprite.x = avatarSize / 2 + 10;
      } else {
        avatarBorder.x = maxWidth - avatarSize / 2 - 10;
        avatarSprite.x = maxWidth - avatarSize / 2 - 10;
      }
      avatarBorder.y = avatarSize / 2 + 10;
      avatarSprite.y = avatarSize / 2 + 10;
      
      container.addChild(avatarBorder);
      container.addChild(avatarSprite);
    } else {
      console.warn(`Avatar not found for ${message.name}`);
    }

    // Create message bubble
    const bubbleContainer = new PIXI.Container();
    const bubbleWidth = maxWidth - avatarSize - 40;
    
    // Layout text and emojis
    let currentX = padding;
    let currentY = padding;
    const lineHeight = this.isMobile ? 20 : 24;
    const maxLineWidth = bubbleWidth - padding * 2;
    
    for (const part of textParts) {
      if (part.type === 'text') {
        const text = new PIXI.Text(part.content, new PIXI.TextStyle({
          fill: 0xffffff,
          fontSize: this.isMobile ? 14 : 16,
          fontFamily: 'system-ui, sans-serif',
          wordWrap: true,
          wordWrapWidth: maxLineWidth,
          lineHeight: lineHeight
        }));
        
        if (currentX + text.width > maxLineWidth) {
          currentX = padding;
          currentY += lineHeight;
        }
        
        text.x = currentX;
        text.y = currentY;
        bubbleContainer.addChild(text);
        currentX += text.width + 4;
      } else if (part.type === 'emoji' && part.name) {
       
        if (this.emojiTextures[part.name]) {
          const emojiSprite = new PIXI.Sprite(this.emojiTextures[part.name]);
          emojiSprite.width = this.isMobile ? 20 : 24;
          emojiSprite.height = this.isMobile ? 20 : 24;
          emojiSprite.anchor.set(0, 0);
          
          if (currentX + emojiSprite.width > maxLineWidth) {
            currentX = padding;
            currentY += lineHeight;
          }
          
          emojiSprite.x = currentX;
          emojiSprite.y = currentY + (lineHeight - emojiSprite.height) / 2;
          bubbleContainer.addChild(emojiSprite);
          currentX += emojiSprite.width + 4;
        } else {
          // Create a colored circle fallback
          const fallbackEmoji = new PIXI.Graphics();
          const color = this.getEmojiFallbackColor(part.name);
          fallbackEmoji.beginFill(color);
          fallbackEmoji.drawCircle(0, 0, this.isMobile ? 10 : 12);
          fallbackEmoji.endFill();
          
          if (currentX + 24 > maxLineWidth) {
            currentX = padding;
            currentY += lineHeight;
          }
          
          fallbackEmoji.x = currentX + 12;
          fallbackEmoji.y = currentY + lineHeight / 2;
          bubbleContainer.addChild(fallbackEmoji);
          currentX += 24 + 4;
        }
      }
    }

    // Create bubble background
    const bubbleHeight = currentY + lineHeight + padding;
    const bubbleBg = new PIXI.Graphics();
    
    // Different colors for different speakers
    const bubbleColor = this.getSpeakerColor(message.name);
    bubbleBg.beginFill(bubbleColor, 0.9);
    bubbleBg.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubbleBg.endFill();
    
    // Add subtle border
    bubbleBg.lineStyle(1, 0x374151, 0.5);
    bubbleBg.drawRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    // Position bubble
    if (isLeft) {
      bubbleContainer.x = avatarSize + 20;
    } else {
      bubbleContainer.x = maxWidth - bubbleWidth - avatarSize - 20;
    }
    bubbleContainer.y = 10;

    bubbleContainer.addChildAt(bubbleBg, 0);
    container.addChild(bubbleContainer);

    // Add speaker name
    const nameText = new PIXI.Text(message.name, new PIXI.TextStyle({
      fill: this.getSpeakerNameColor(message.name),
      fontSize: this.isMobile ? 12 : 14,
      fontFamily: 'system-ui, sans-serif',
      fontWeight: 'bold'
    }));
    
    if (isLeft) {
      nameText.x = avatarSize + 20;
    } else {
      nameText.x = maxWidth - bubbleWidth - avatarSize - 20;
    }
    nameText.y = bubbleHeight + 15;
    
    container.addChild(nameText);

    container.height = bubbleHeight + 40;
    return container;
  }

  private parseMessageText(text: string): Array<{type: 'text' | 'emoji', content: string, name?: string}> {
    const parts: Array<{type: 'text' | 'emoji', content: string, name?: string}> = [];
    const regex = /\{([^}]+)\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      const emojiName = match[1].trim();
      
      if (this.emojiTextures[emojiName]) {
        parts.push({
          type: 'emoji',
          content: '',
          name: emojiName
        });
      } else {
        // Fallback to text if emoji not found
        parts.push({
          type: 'text',
          content: `{${emojiName}}`
        });
      }
      
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    return parts;
  }

  private animateMessagesSequentially(messageContainers: PIXI.Container[]) {
    messageContainers.forEach((container, index) => {
      // Delay each message appearance
      const delay = index * 1200; // 1200ms delay between messages
      
      setTimeout(() => {
        this.animateMessageEntrance(container, container.y as number);
        
      }, delay);
    });
  }

  private animateMessageEntrance(container: PIXI.Container, containerY: number) {
    // Create typing indicator first
    this.showTypingIndicator(container);
    
    // After typing animation, show the message
    setTimeout(() => {
      this.hideTypingIndicator();
      
      // Animate message entrance
      const startTime = Date.now();
      const duration = 400;
      const startScale = 0.8;
      const endScale = 1;
      const startAlpha = 0;
      const endAlpha = 1;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutBack = (t: number) => {
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        
        const easedProgress = easeOutBack(progress);
        
        container.scale.set(startScale + (endScale - startScale) * easedProgress);
        container.alpha = startAlpha + (endAlpha - startAlpha) * easedProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log(containerY);
          // const totalHeight = this.chatContainer!.height;
          const viewHeight = this.app.renderer.height;
          if (containerY > viewHeight - 150) {
            this.scrollToBottom();
          }
        }
      };
      
      animate();
    }, 600); // Show typing indicator for 600ms
  }

  private showTypingIndicator(container: PIXI.Container) {
    const typingContainer = new PIXI.Container();
    typingContainer.name = 'typingIndicator';
    
    // Create typing dots with better styling
    const dots: PIXI.Graphics[] = [];
    for (let i = 0; i < 3; i++) {
      const dot = new PIXI.Graphics();
      dot.beginFill(0x6b7280); // Better color for typing dots
      dot.drawCircle(0, 0, 4);
      dot.endFill();
      dot.x = i * 16; // More spacing between dots
      typingContainer.addChild(dot);
      dots.push(dot);
    }
    
    // Calculate position where the new message will appear
    const maxWidth = this.isMobile ? this.app.renderer.width * 0.9 : Math.min(this.app.renderer.width * 0.8, 800);
    const avatarSize = this.isMobile ? 40 : 50;
    
    // Position typing indicator at the bottom of the current message area
    // This will be where the new message will appear
    const messageIndex = this.chatData?.dialogue.findIndex(m => 
      this.chatContainer?.children.some(child => child === container)
    ) || 0;
    const isLeft = messageIndex % 2 === 0; // Same logic as message positioning
    
    // Calculate the position where the new message bubble will start
    let typingX: number;
    if (isLeft) {
      typingX = avatarSize + 20; // Left side positioning
    } else {
      typingX = maxWidth - avatarSize - 20; // Right side positioning
    }
    
    // Position at the bottom of the current message
    const typingY = container.y + container.height + 10;
    
    const chatOffsetY = this.chatContainer ? this.chatContainer.y : 0; // 🟢 UPDATED
    typingContainer.x = this.chatContainer ? this.chatContainer.x + typingX : typingX;
    typingContainer.y = typingY + chatOffsetY; // 🟢 UPDATED
    
    
    // Animate dots with better animation
    const animateDots = () => {
      dots.forEach((dot, index) => {
        const delay = index * 150; // Faster animation
        setTimeout(() => {
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = (elapsed % 600) / 600; // 600ms cycle
            dot.alpha = 0.4 + 0.6 * (1 + Math.sin(progress * Math.PI * 2)) / 2;
            requestAnimationFrame(animate);
          };
          animate();
        }, delay);
      });
    };
    
    animateDots();
    this.view.addChild(typingContainer);
  }

  private hideTypingIndicator() {
    const typingIndicator = this.view.getChildByName('typingIndicator');
    if (typingIndicator) {
      this.view.removeChild(typingIndicator);
    }
  }

  private getSpeakerColor(name: string): number {
    const colors: Record<string, number> = {
      'Sheldon': 0x1e40af, // Blue
      'Penny': 0xdc2626,   // Red
      'Leonard': 0x059669, // Green
      'Neighbour': 0x7c3aed // Purple
    };
    return colors[name] || 0x374151; // Default gray
  }

  private getSpeakerNameColor(name: string): number {
    const colors: Record<string, number> = {
      'Sheldon': 0x60a5fa, // Light blue
      'Penny': 0xf87171,   // Light red
      'Leonard': 0x34d399, // Light green
      'Neighbour': 0xa78bfa // Light purple
    };
    return colors[name] || 0x9ca3af; // Default light gray
  }

  show() { 
    this.view.visible = true; 
    this.layout();
  }

  hide() { 
    this.view.visible = false; 
  }
  
  layout() {
    // Layout is handled in renderChatMessages
  }

  private scrollToBottom(animated = true) {
    if (!this.chatContainer) return;

    const totalHeight = this.chatContainer.height;
    const viewHeight = this.app.renderer.height;

    // 🟢 Calculate offset only when content taller than view
    const overflow = totalHeight - viewHeight + 150; // margin at bottom
    if (overflow <= 0) return; // nothing to scroll yet

    const targetY = -overflow; // move container upward

    if (animated) {
      const startY = this.chatContainer.y;
      const startTime = Date.now();
      const duration = 400;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

      const animate = () => {
        const progress = Math.min((Date.now() - startTime) / duration, 1);
        const eased = easeOut(progress);
        this.chatContainer!.y = startY + (targetY - startY) * eased;
        if (progress < 1) requestAnimationFrame(animate);
      };
      animate();
    } else {
      this.chatContainer.y = targetY;
    }
  }

}
