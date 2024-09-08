import { colorizeInPlace, drawDottedGrid, eraseColorInPlace, getImageRegion } from "../canvas-utils";
import { sine } from "../core/easing";
import { MouseEvent } from "../core/event";
import Container from "../display/container";
import Sprite from "../display/sprite";
import { IGame } from "../game";
import { isMobile } from "../registry";
import { logDebug } from "../utils";
import { Elevator, ElevatorShaft } from "./game/elevator";
import { GameArea } from "./game/game-area";
import { Sidebar } from "./game/sidebar";
import { BaseScene } from "./scene";

type GameSceneDimensions = {
  floorHeight: number;
  wallSize: number;
  gameAreaSize: number;
  canvasSize: number;
  sidebarSize: number;
  sceneWidth: number;
  sceneHeight: number;
};

export const getGameSceneDimensions = (numFloors: number): GameSceneDimensions => {
  const floorHeight = 16 * 4;
  const wallSize = 16 / 2;
  const gameAreaSize = numFloors * floorHeight;
  const canvasSize = gameAreaSize + wallSize * 2;
  const sidebarSize = 16 * 9;
  return {
    floorHeight,
    wallSize,
    gameAreaSize,
    canvasSize,
    sidebarSize,
    sceneWidth: canvasSize + sidebarSize * +!isMobile,
    sceneHeight: canvasSize + sidebarSize * +isMobile,
  };
};

export const NUM_FLOORS = 8;

export class GameScene extends BaseScene {
  sceneDimensions: GameSceneDimensions;
  private root: Container;
  private elevators: [Elevator, Elevator];
  constructor(private game: IGame) {
    document.querySelector<HTMLStyleElement>(".cc")!.style.imageRendering = "pixelated";
    super();
    const sceneDimensions = getGameSceneDimensions(NUM_FLOORS);
    const { canvasSize, sidebarSize, sceneWidth, sceneHeight, wallSize, gameAreaSize, floorHeight } = sceneDimensions;
    game.resize(sceneWidth, sceneHeight);
    this.sceneDimensions = sceneDimensions;

    const [charImage, , frameImage, fencePatternImage] = game.assets;

    this.root = new Container();

    const gameArea = new GameArea(gameAreaSize, floorHeight, wallSize, NUM_FLOORS, wallSize, wallSize);
    const fencePattern = c.getContext("2d")!.createPattern(fencePatternImage, "repeat")!;
    const tileSize = 32;

    const elevatorHeight = (tileSize / 2) * 3 - wallSize;

    const smallElevatorStartPosX = tileSize * 8;
    const smallElevatorWidth = tileSize * 2;
    const smallShaft = new ElevatorShaft(fencePattern, smallElevatorWidth, gameAreaSize, smallElevatorStartPosX);
    const smallElevator = new Elevator(
      smallElevatorWidth,
      elevatorHeight,
      smallElevatorStartPosX,
      floorHeight * 1,
    );

    const largeElevatorStartPosX = tileSize * 11;
    const largeElevatorWidth = tileSize * 3;
    const largeShaft = new ElevatorShaft(fencePattern, largeElevatorWidth, gameAreaSize, largeElevatorStartPosX);
    const largeElevator = new Elevator(
      largeElevatorWidth,
      elevatorHeight,
      largeElevatorStartPosX,
      floorHeight * 2,
    );

    const [charCanvas, charContext] = getImageRegion(charImage, 0, 0, 9, 9);
    eraseColorInPlace(charCanvas, charContext);
    colorizeInPlace(charCanvas, charContext, "#111111");
    // this.atlas = wrapCanvasFunc(scalePixelated, charCanvas, 3);

    const char = new Sprite(charCanvas, 32, 64);
    char.scale.x = char.scale.y = 3;
    char.pivot.x = 0.5;
    char.pivot.y = 1;
    char.scale.x = -3;

    gameArea.children.push(smallShaft, smallElevator, largeShaft, largeElevator, char);
    this.elevators = [smallElevator, largeElevator];

    const sidebar = new Sidebar(
      (floorId) => {
        logDebug(floorId);
      },
      frameImage,
      sidebarSize,
      canvasSize,
      +!isMobile * canvasSize,
      +isMobile * canvasSize,
    );

    this.root.children.push(gameArea, sidebar);
  }
  update(dt: number): void {
    this.root.update(dt);
  }
  draw(context: CanvasRenderingContext2D): void {
    const { canvasSize, wallSize, gameAreaSize } = this.sceneDimensions;

    context.fillStyle = "red";
    context.fillRect(0, 0, canvasSize, canvasSize);

    this.root.draw(context);

    drawDottedGrid(context, wallSize, wallSize, gameAreaSize, gameAreaSize, 32);
  }
  onClick(mouseX: number, mouseY: number): void {
    this.root.dispatchEvent(new MouseEvent(mouseX, mouseY));

    return;

    const { elevators, game, sceneDimensions } = this;
    const smallElevator = elevators[0];
    // open doors animation
    game.tweener.tweenProperty(
      30,
      0,
      32,
      sine,
      (v) => (smallElevator.doorWidth = v),
      () => {
        smallElevator.doorWidth = 32;

        // game.tweener.tweenProperty(
        //   120,
        //   smallElevator.position.y,
        //   sceneDimensions.floorHeight * 0 + 16,
        //   sine,
        //   (v) => (smallElevator.position.y = v),
        //   () => {
        //     smallElevator.position.y = sceneDimensions.floorHeight * 0 + 16;
        //   },
        // );
      },
    );
  }
}
