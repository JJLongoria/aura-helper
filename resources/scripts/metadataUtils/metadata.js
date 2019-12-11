const APEX_CLASS = "ApexClass";
const APEX_COMPONENT = "ApexComponent";
const APEX_PAGE = "ApexPage";
const APEX_TRIGGER = "ApexTrigger";
const APPROVAL_PROCESSES = "ApprovalProcess";
const ASSIGNMENT_RULES = "AssignmentRules";
const BUSINESS_PROCESS = "BusinessProcess";
const COMPACT_LAYOUT = "CompactLayout";
const CONNECTED_APP = "ConnectedApp";
const APP = "CustomApplication";
const APP_COMPONENT = "CustomApplicationComponent";
const CUSTOM_FIELDS = "CustomField";
const CUSTOM_LABELS = "CustomLabel";
const CUSTOM_OBJECT = "CustomObject";
const CUSTOM_OBJECT_TRANSLATIONS = "CustomObjectTranslation";
const TAB = "CustomTab";
const DASHBOARD = "Dashboard";
const DOCUMENT = "Document";
const EMAIL_TEMPLATE = "EmailTemplate";
const FLOWS = "Flow";
const HOME_COMPONENT = "HomePageComponent";
const HOME_LAYOUT = "HomePageLayout";
const LAYOUT = "Layout";
const LISTVIEW = "ListView";
const PERMISSION_SET = "PermissionSet";
const PROFILE = "Profile";
const QUEUE = "Queue";
const ACTION = "QuickAction";
const RECORD_TYPE = "RecordType";
const REMOTE_SITE = "RemoteSiteSetting";
const REPORTS = "Report";
const ROLE = "Role";
const SHARING_RULE = "SharingRules";
const STATIC_RESOURCE = "StaticResource";
const TANSLATION = "Translations";
const VALIDATION_RULE = "ValidationRule";
const BUTTON_OR_LINK = "WebLink";
const WORKFLOW = "Workflow";
const WORKFLOW_ALERT = "WorkflowAlert";
const WORKFLOW_FIELD_UPDATE = "WorkflowFieldUpdate";
const WORKFLOW_RULE = "WorkflowRule";
const WORKFLOW_TASK = "WorkflowTask";
const FLOW_DEFINITION = "FlowDefinition";

// Constants for metadata folders
const OBJECTS_FOLDER = "objects";
const APEX_CLASS_FLDR = "classes";
const APEX_PAGE_FLDR = "pages";
const APEX_COMPONENT_FLDR = "components";
const APEX_TRIGGER_FLDR = "triggers";
const LAYOUT_FLDR = "layouts";
const HOME_LAYOUT_FLDR = "homePageLayouts";
const HOME_COMPONENT_FLDR = "homePageComponents";
const WORKFLOW_RULE_FLDR = "workflows";
const WORKFLOW_FIELD_UPDATE_FLDR = "workflows";
const WORKFLOW_ALERT_FLDR = "workflows";
const WORKFLOWS_FLDR = "workflows";
const ACTIONS_FOLDER = "quickActions";
const STATIC_RESOURCE_FLDR = "staticresources";
const DOCUMENT_FLDR = "documents";
const EMAIL_TEMPLATE_FLDR = "email";
const REMOTE_SITES_FLDR = "remoteSiteSettings";
const CONNECTED_APPS_FLDR = "connectedApps";
const TABS_FLDR = "tabs";
const PROFILE_FLDR = "profiles";
const PERMISSION_SETS_FLDR = "permissionsets";
const ROLES_FLDR = "roles";
const APPROVAL_PROCESSES_FLDR = "approvalProcesses";
const SHARING_RULES_FLDR = "sharingRules";
const TRANSLATIONS_FLDR = "translations";
const QUEUES_FLDR = "queues";
const APP_FLRD = "applications";

function createMetadataType(name, checked) { 
     return {
          name: name,
          checked: (checked) ? checked : false,
          childs: []
     };
}

function createMetadataObject(name, checked) { 
     return {
          name: name,
          checked: (checked) ? checked : false,
          childs: []
     };
}

function createMetadataItem(name, checked) { 
     return {
          name: name,
          checked: (checked) ? checked : false,
     };
}

module.exports = {
     createMetadataType,
     createMetadataObject,
     createMetadataItem,


     APEX_CLASS,
     APEX_COMPONENT,
     APEX_PAGE,
     APEX_TRIGGER,
     APPROVAL_PROCESSES,
     ASSIGNMENT_RULES,
     BUSINESS_PROCESS,
     COMPACT_LAYOUT,
     CONNECTED_APP,
     APP,
     APP_COMPONENT,
     CUSTOM_FIELDS,
     CUSTOM_LABELS,
     CUSTOM_OBJECT,
     CUSTOM_OBJECT_TRANSLATIONS,
     TAB,
     DASHBOARD,
     DOCUMENT,
     EMAIL_TEMPLATE,
     FLOWS,
     HOME_COMPONENT,
     HOME_LAYOUT,
     LAYOUT,
     LISTVIEW,
     PERMISSION_SET,
     PROFILE,
     QUEUE,
     ACTION,
     RECORD_TYPE,
     REMOTE_SITE,
     REPORTS,
     ROLE,
     SHARING_RULE,
     STATIC_RESOURCE,
     TANSLATION,
     VALIDATION_RULE,
     BUTTON_OR_LINK,
     WORKFLOW,
     WORKFLOW_ALERT,
     WORKFLOW_FIELD_UPDATE,
     WORKFLOW_RULE,
     WORKFLOW_TASK,
     FLOW_DEFINITION,
     OBJECTS_FOLDER,
     APEX_CLASS_FLDR,
     APEX_PAGE_FLDR,
     APEX_COMPONENT_FLDR,
     APEX_TRIGGER_FLDR,
     LAYOUT_FLDR,
     HOME_LAYOUT_FLDR,
     HOME_COMPONENT_FLDR,
     WORKFLOW_RULE_FLDR,
     WORKFLOW_FIELD_UPDATE_FLDR,
     WORKFLOW_ALERT_FLDR,
     WORKFLOWS_FLDR,
     ACTIONS_FOLDER,
     STATIC_RESOURCE_FLDR,
     DOCUMENT_FLDR,
     EMAIL_TEMPLATE_FLDR,
     REMOTE_SITES_FLDR,
     CONNECTED_APPS_FLDR,
     TABS_FLDR,
     PROFILE_FLDR,
     PERMISSION_SETS_FLDR,
     ROLES_FLDR,
     APPROVAL_PROCESSES_FLDR,
     SHARING_RULES_FLDR,
     TRANSLATIONS_FLDR,
     QUEUES_FLDR,
     APP_FLRD
}