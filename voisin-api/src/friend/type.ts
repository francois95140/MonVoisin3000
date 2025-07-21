export interface ServerToClientEvent {
  newFriendrequest: (payload : Friendrequest) => void;
}

export class Friendrequest {
  id: string;
  pseudo: string;
}