const enqueue = (queue, queueItem) => {
    return [...queue, queueItem];
};
const dequeue = (queue) => {
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
const fetchPackets = async () => {
    const response = await fetch("http://localhost:4000/api/packets");
    const data = (await response.json()).data;
    return data;
};
const packets = await fetchPackets();
//
// Group the emails by the sender:
const createItemGroups = (packets, from) => {
    return packets.filter((packet) => packet.from === from);
};
const uniqueSenders = Array.from(new Set(packets.map((packet) => packet.from)));
const groupedItems = uniqueSenders.map((sender) => {
    return createItemGroups(packets, sender);
});
//
// Print the emails:
const printEmail = (items) => {
    // Enqueue the items:
    let itemsQueue = [];
    items.forEach((item) => {
        itemsQueue = enqueue(itemsQueue, {
            value: item.payload,
            priority: item.stamp,
        });
    });
    // Find the item with the highest priority:
    let lastItem = dequeue(itemsQueue);
    if (lastItem === null) {
        return;
    }
    // Print the items based on priority:
    let priority = lastItem.priority;
    for (let i = priority; itemsQueue.length !== 0; i--) {
        if (lastItem !== null) {
            const index = itemsQueue.indexOf(lastItem);
            let emails = document.querySelector(".emails");
            if (emails) {
                emails.innerHTML += `<p class="email__line email__line${i}">${lastItem.value}</p>`;
                itemsQueue.splice(index, 1);
                lastItem = dequeue(itemsQueue);
                if (lastItem !== null) {
                    priority = lastItem.priority;
                }
            }
            else {
                console.log("There is nothing to see here!");
            }
        }
    }
    return;
};
//
// Print emails for all grouped items:
groupedItems.forEach((group) => {
    printEmail(group);
});
export {};
