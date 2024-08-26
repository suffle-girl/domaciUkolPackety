export {};

interface Packet {
  id: number;
  from: string;
  to: string;
  payload: string;
  stamp: number;
}

interface QueueItem<T> {
  value: T;
  priority: number;
}

type PriorityQueue<T> = QueueItem<T>[];

const enqueue = <T>(
  queue: PriorityQueue<T>,
  queueItem: QueueItem<T>
): PriorityQueue<T> => {
  return [...queue, queueItem];
};

const dequeue = <T>(queue: PriorityQueue<T>): QueueItem<T> | null => {
  if (queue.length === 0) {
    return null;
  }

  let highestPriorityItem = queue[0];
  for (let i = 1; i < queue.length; i++) {
    if (queue[i].priority > highestPriorityItem.priority) {
      highestPriorityItem = queue[i];
    }
  }

  return highestPriorityItem;
};

//
// Fetch the data:

const fetchPackets = async (): Promise<Packet[]> => {
  const response = await fetch("http://localhost:4000/api/packets");
  const data: Packet[] = (await response.json()).data;
  return data;
};

const packets = await fetchPackets();

//
// Group the emails by the sender:

const createItemGroups = (packets: Packet[], from: string): Packet[] => {
  return packets.filter((packet) => packet.from === from);
};

const uniqueSenders: string[] = Array.from(
  new Set(packets.map((packet) => packet.from))
);

const groupedItems: Packet[][] = uniqueSenders.map(
  (sender: string): Packet[] => {
    return createItemGroups(packets, sender);
  }
);

//
// Print the emails:

const printEmail = (items: Packet[]): void => {
  // Enqueue the items:
  let itemsQueue: PriorityQueue<string> = [];
  items.forEach((item: Packet): void => {
    itemsQueue = enqueue(itemsQueue, {
      value: item.payload,
      priority: item.stamp,
    });
  });

  // Find the item with the highest priority:
  let lastItem: QueueItem<string> | null = dequeue(itemsQueue);

  if (lastItem === null) {
    return;
  }

  // Print the items based on priority:
  let priority: number = lastItem.priority;

  for (let i = priority; itemsQueue.length !== 0; i--) {
    if (lastItem !== null) {
      const index: number = itemsQueue.indexOf(lastItem);
      let emails: HTMLDivElement | null = document.querySelector(".emails");

      if (emails) {
        emails.innerHTML += `<p class="email__line email__line${i}">${lastItem.value}</p>`;
        itemsQueue.splice(index, 1);
        lastItem = dequeue(itemsQueue);

        if (lastItem !== null) {
          priority = lastItem.priority;
        }
      } else {
        console.log("There is nothing to see here!");
      }
    }
  }

  return;
};

//
// Print emails for all grouped items:
groupedItems.forEach((group: Packet[]): void => {
  printEmail(group);
});
