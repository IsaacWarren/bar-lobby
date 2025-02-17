import { defaultBoxes, defaultMapBoxes } from "@/config/default-boxes";
import { AbstractBattle } from "@/model/battle/abstract-battle";
import { Bot, StartBox, StartPosType } from "@/model/battle/battle-types";
import { User } from "@/model/user";

export class OfflineBattle extends AbstractBattle {
    public override leave() {
        super.leave();

        api.session.offlineBattle.value = null;
        api.session.onlineUser.battleStatus.battleId = -1;
    }

    public start() {
        api.game.launch(this);
    }

    public setEngine(engineVersion: string) {
        this.battleOptions.engineVersion = engineVersion;
        api.content.ai.processAis(engineVersion);
    }

    public setGame(gameVersion: string) {
        this.battleOptions.gameVersion = gameVersion;
    }

    public setMap(map: string) {
        this.battleOptions.map = map;

        const boxes = defaultMapBoxes()[map] ?? defaultBoxes().NorthVsSouth;

        this.setStartBoxes(boxes);
    }

    public setStartPosType(startPosType: StartPosType) {
        this.battleOptions.startPosType = startPosType;
    }

    public setStartBoxes(startBoxes: StartBox[]) {
        this.battleOptions.startBoxes = startBoxes;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public setGameOptions(options: Record<string, any>) {
        this.battleOptions.gameOptions = options;
    }

    public addBot(bot: Bot) {
        this.bots.push(bot);
        this.fixIds();
    }

    public removeBot(bot: Bot) {
        this.bots.splice(this.bots.indexOf(bot), 1);
        this.fixIds();
    }

    public playerToSpectator(player: User) {
        player.battleStatus.isSpectator = true;
        this.fixIds();
    }

    public spectatorToPlayer(spectator: User, teamId: number) {
        spectator.battleStatus.isSpectator = false;
        spectator.battleStatus.teamId = teamId;
        this.fixIds();
    }

    public setContenderTeam(contender: User | Bot, teamId: number) {
        if ("userId" in contender) {
            contender.battleStatus.teamId = teamId;
        } else {
            contender.teamId = teamId;
        }
        this.fixIds();
    }

    public setBotOptions(botName: string, options: Record<string, unknown>) {
        const bot = this.getParticipantByName(botName) as Bot;
        bot.aiOptions = options;
    }

    protected fixIds() {
        const contenders = this.contenders.value;

        const playerIds = Array.from(new Set(contenders.map((c) => ("userId" in c ? c.battleStatus.playerId : c.playerId))).values()).sort();
        const teamIds = Array.from(new Set(contenders.map((c) => ("userId" in c ? c.battleStatus.teamId : c.teamId))).values()).sort();
        for (const contender of contenders) {
            const newPlayerId = playerIds.indexOf("userId" in contender ? contender.battleStatus.playerId : contender.playerId);
            "userId" in contender ? (contender.battleStatus.playerId = newPlayerId) : (contender.playerId = newPlayerId);

            const newTeamId = teamIds.indexOf("userId" in contender ? contender.battleStatus.teamId : contender.teamId);
            "userId" in contender ? (contender.battleStatus.teamId = newTeamId) : (contender.teamId = newTeamId);
        }
    }
}
