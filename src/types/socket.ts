
export interface NewBidEvent {
    amount: number;
    bidderName: string;
    timestamp: string;
    auctionId?: string; // Optional helper mapping
}

export interface AuctionEndingSoonEvent {
    auctionId: string;
    secondsRemaining: number;
}

export interface AuctionSoldEvent {
    auctionId: string;
    winnerName: string;
    finalPrice: number;
}

export interface AuctionExpiredEvent {
    auctionId: string;
}

export interface ViewerCountEvent {
    auctionId: string;
    count: number;
}
