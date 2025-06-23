import { useCasino } from "./CasinoProvider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { formatEther } from "ethers";

export function GameHistory() {
    const { gameHistory } = useCasino();

    return (
        <Card className="w-full max-w-md bg-gray-900 text-white border-gray-700">
            <CardHeader>
                <CardTitle className="text-lg font-medium">Game History</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-72">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-700">
                                <TableHead className="text-white">Game</TableHead>
                                <TableHead className="text-white">Bet</TableHead>
                                <TableHead className="text-white">Result</TableHead>
                                <TableHead className="text-white">Payout</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gameHistory.length > 0 ? (
                                gameHistory.map((game) => (
                                    <TableRow key={game.gameId} className="border-gray-800">
                                        <TableCell>Dice Roll #{game.gameId}</TableCell>
                                        <TableCell>
                                            {game.betAmount ? formatEther(game.betAmount) : '...'} FLOW
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={game.win ? 'bg-green-500' : 'bg-red-500'}>
                                                {game.win ? "Win" : "Loss"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={game.win ? 'text-green-400' : 'text-red-400'}>
                                            {game.payout ? formatEther(game.payout) : '0.0'} FLOW
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-400">No games played yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    )
} 