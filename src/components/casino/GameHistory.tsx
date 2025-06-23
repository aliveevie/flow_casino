import { useCasino } from "./CasinoProvider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { formatEther } from "ethers";

export function GameHistory() {
    const { gameHistory } = useCasino();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Game History</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Game</TableHead>
                                <TableHead>Bet</TableHead>
                                <TableHead>Result</TableHead>
                                <TableHead>Payout</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gameHistory.length > 0 ? (
                                gameHistory.map((game) => (
                                    <TableRow key={game.gameId}>
                                        <TableCell>Dice Roll #{game.gameId}</TableCell>
                                        <TableCell>
                                            {game.betAmount ? formatEther(game.betAmount) : '...'} FLOW
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={game.win ? 'default' : 'destructive'}>
                                                {game.win ? "Win" : "Loss"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={game.win ? 'text-green-400' : ''}>
                                            {game.payout ? formatEther(game.payout) : '0.0'} FLOW
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No games played yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
} 