export const personInfo = {
    name: "Vikram Malhotra",
    role: "Senior Relationship Manager",
    rating: "4.9",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1287&auto=format&fit=crop",
};

export const timelineData = [
    {
        id: "1",
        status: "completed",
        title: "Request received",
        time: "Oct 12, 2023 • 10:45 AM"
    },
    {
        id: "2",
        status: "completed",
        title: "Sales officer assigned",
        time: "Oct 13, 2023 • 02:15 PM"
    },
    {
        id: "3",
        status: "completed",
        title: "Properties shortlisted",
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop"
        ],
        extraImagesCount: 2
    },
    {
        id: "4",
        status: "completed",
        title: "Site visit scheduled",
        actionText: "Oct 20, 11:00 AM",
        actionIcon: "calendar"
    },
    {
        id: "5",
        status: "current",
        title: "Negotiation",
        badge: "IN PROGRESS",
        description: "Vikram is negotiating the final price for 'Elite Residencies, Block B'.",
        askingPrice: "$850,000",
        currentOffer: "$815,000"
    },
    {
        id: "6",
        status: "pending",
        title: "Token payment",
        time: "Waiting for price agreement",
        iconName: "cash-outline"
    },
    {
        id: "7",
        status: "pending",
        title: "Registry process",
        time: "Documentation queue",
        iconName: "document-text-outline"
    },
    {
        id: "8",
        status: "pending",
        title: "Deal completed",
        time: "Handover & Keys",
        iconName: "trophy-outline"
    }
];

export const dealsData = [
    {
        id: "1",
        dealId: "#SQ-88291",
        title: "Skyline Residency 4B",
        location: "Bandra West, Mumbai",
        status: "Active",
        totalValue: "₹1.20 Cr",
        paidSoFar: "₹48 L",
        nextDue: "₹4.8 L",
        completionPercentage: 40,
        imageColor: "#5B3AF5",
        isActive: true,
        isPending: false,
    },
    {
        id: "2",
        dealId: "#SQ-88292",
        title: "Skyline Residency 4B",
        location: "Bandra West, Mumbai",
        status: "Pending",
        totalValue: "₹1.20 Cr",
        paidSoFar: "₹48 L",
        nextDue: "₹4.8 L",
        completionPercentage: 40,
        imageColor: "#2A2362",
        isActive: false,
        isPending: true,
    }
];

export const headerStats = {
    activeDeals: 3,
    pendingDeals: 1,
    totalValue: "$2.4M"
};

export const nextPaymentDue = {
    amount: "₹4,80,000",
    date: "Oct 15, 2024",
    daysRemaining: 3
};

export const PAYMENTS_TABS = ["All", "Paid", "Upcoming", "Overdue"];

export const paymentsData = [
    { id: "1", amount: "₹6,00,000", title: "Booking Amount", date: "Sep 01, 2024", status: "Paid", seq: "01" },
    { id: "2", amount: "₹7,00,000", title: "Allotment Charge", date: "Sep 01, 2024", status: "Paid", seq: "02" },
    { id: "3", amount: "₹1,00,000", title: "Foundation Charge", date: "Sep 01, 2024", status: "Paid", seq: "03" },
    { id: "4", amount: "₹4,80,000", title: "Plinth Completion", date: "Due · Oct 15, 2024", status: "Due Soon", seq: "04" },
    { id: "5", amount: "₹4,80,000", title: "Slab 1 Completion", date: "Nov 15, 2024", status: "Upcoming", seq: "05" },
    { id: "6", amount: "₹5,00,000", title: "Slab 2 Completion", date: "Dec 15, 2024", status: "Upcoming", seq: "06" },
    { id: "7", amount: "₹5,00,000", title: "Slab 3 Completion", date: "Jan 15, 2025", status: "Upcoming", seq: "07" },
    { id: "8", amount: "₹2,50,000", title: "Penalty Charge", date: "Overdue by 15 Days", status: "Overdue", seq: "08" },
];

export const documentsData = [
    {
        sectionTitle: "AGREEMENT DOCUMENTS",
        documents: [
            { id: "d1", title: "Sale Agreement.pdf", meta: "2.4 MB · PDF", status: "Verified", icon: "document-text" },
            { id: "d2", title: "Builder Buyer Agreement.pdf", meta: "5.1 MB · PDF", status: "Verified", icon: "document-text" },
            { id: "d3", title: "Allotment Letter.pdf", meta: "1.2 MB · PDF", status: "Pending", icon: "clipboard" }
        ]
    },
    {
        sectionTitle: "IDENTITY & KYC",
        documents: [
            { id: "d4", title: "Aadhaar Card.jpg", meta: "890 KB · Image", status: "Verified", icon: "id-card" },
            { id: "d5", title: "PAN Card.jpg", meta: "650 KB · Image", status: "Verified", icon: "id-card" },
            { id: "d6", title: "Address Proof", meta: "Not Uploaded", status: "Required", icon: "clipboard" }
        ]
    }
];