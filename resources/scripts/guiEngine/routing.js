const Routing = {
    Help: {
        name: "Help",
        type: "Help",
        path: '/gui/help',
    },
    PackageGenerator: {
        name: "Package Generator",
        type: "PackageGenerator",
        path: '/gui/metadata/packageGenerator',
    },
    Profile: {
        name: "Profile",
        type: "Profile",
        path: '/gui/metadata/profile',
    },
    MatchOrg: {
        name: "Match Org Metadata With Local",
        type: "MatchOrg",
        path: "/gui/metadata/matchOrg"
    },
    CustomLabels: {
        name: "Custom Labels",
        type: "CustomLabels",
        path: "/gui/metadata/customLabels"
    }
};
module.exports = Routing;