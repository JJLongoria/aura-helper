const logger = require('../main/logger');
const languages = require('../languages');
const fileSystem = require('../fileSystem');
const vscode = require('vscode');
const metadata = require('../metadata');
const AuraParser = languages.AuraParser;
const window = vscode.window;
const Range = vscode.Range;
const FileChecker = fileSystem.FileChecker;
const FileReader = fileSystem.FileReader;
const FileWriter = fileSystem.FileWriter;
const Paths = fileSystem.Paths;
const AnalyticSnapshotUtils = metadata.AnalyticSnapshotUtils;
const ApexTestSuiteUtils = metadata.ApexTestSuiteUtils;
const AppMenuUtils = metadata.AppMenuUtils;
const ApprovalProcessUtils = metadata.ApprovalProcessUtils;
const AssignmentRulesUtils = metadata.AssignmentRulesUtils;
const AudienceUtils = metadata.AudienceUtils;
const AutoResponseRulesUtils = metadata.AutoResponseRulesUtils;
const BotUtils = metadata.BotUtils;
const BrandingSetUtils = metadata.BrandingSetUtils;
const CallCenterUtils = metadata.CallCenterUtils;
const CleanDataServiceUtils = metadata.CleanDataServiceUtils;
const CMSConnectSourceUtils = metadata.CMSConnectSourceUtils;
const CommunityZoneUtils = metadata.CommunityZoneUtils;
const CommunityTemplateDefinitionUtils = metadata.CommunityTemplateDefinitionUtils;
const CommunityThemeDefinitionUtils = metadata.CommunityThemeDefinitionUtils;
const ConnectedAppUtils = metadata.ConnectedAppUtils;
const ContentAssetUtils = metadata.ContentAssetUtils;
const CustomApplicationUtils = metadata.CustomApplicationUtils;
const CustomFeedFilterUtils = metadata.CustomFeedFilterUtils;
const CustomHelpMenuSectionUtils = metadata.CustomHelpMenuSectionUtils;
const CustomLabelsUtils = metadata.CustomLabelsUtils;
const CustomMetadataUtils = metadata.CustomMetadataUtils;
const CustomObjectUtils = metadata.CustomObjectUtils;
const CustomObjectTranslationUtils = metadata.CustomObjectTranslationUtils;
const CustomPermissionUtils = metadata.CustomPermissionUtils;
const CustomSiteUtils = metadata.CustomSiteUtils;
const CustomTabUtils = metadata.CustomTabUtils;
const DashboardUtils = metadata.DashboardUtils;
const DuplicateRuleUtils = metadata.DuplicateRuleUtils;
const EclairGeoDataUtils = metadata.EclairGeoDataUtils;
const EmailServicesFunctionUtils = metadata.EmailServicesFunctionUtils;
const EmailTemplateUtils = metadata.EmailTemplateUtils;
const EmbeddedServiceConfigUtils = metadata.EmbeddedServiceConfigUtils;
const EmbeddedServiceLiveAgentUtils = metadata.EmbeddedServiceLiveAgentUtils;
const EntitlementProcessUtils = metadata.EntitlementProcessUtils;
const EscalationRulesUtils = metadata.EscalationRulesUtils;
const EventDeliveryUtils = metadata.EventDeliveryUtils;
const EventSubscriptionUtils = metadata.EventSubscriptionUtils;
const ExternalDataSourceUtils = metadata.ExternalDataSourceUtils;
const FlexiPageUtils = metadata.FlexiPageUtils;
const FlowCategoryUtils = metadata.FlowCategoryUtils;
const GlobalPicklistUtils = metadata.GlobalPicklistUtils;
const GlobalValueSetUtils = metadata.GlobalValueSetUtils;
const GlobalValueSetTranslationUtils = metadata.GlobalValueSetTranslationUtils;
const KeywordListUtils = metadata.KeywordListUtils;
const LayoutUtils = metadata.LayoutUtils;
const LightningBoltUtils = metadata.LightningBoltUtils;
const LightningMessageChannelUtils = metadata.LightningMessageChannelUtils;
const ManagedContentTypeUtils = metadata.ManagedContentTypeUtils;
const MatchingRulesUtils = metadata.MatchingRulesUtils;
const MlDomainUtils = metadata.MlDomainUtils;
const ModerationRuleUtils = metadata.ModerationRuleUtils;
const NavigationMenuUtils = metadata.NavigationMenuUtils;
const PathAssistantUtils = metadata.PathAssistantUtils;
const PermissionSetUtils = metadata.PermissionSetUtils;
const PlatformCachePartitionUtils = metadata.PlatformCachePartitionUtils;
const PlatformEventChannelUtils = metadata.PlatformEventChannelUtils;
const ProfileUtils = metadata.ProfileUtils;
const QuickActionUtils = metadata.QuickActionUtils;
const ReportUtils = metadata.ReportUtils;
const ReportTypeUtils = metadata.ReportTypeUtils;
const SharingSetUtils = metadata.SharingSetUtils;
const StandardValueSetTranslationUtils = metadata.StandardValueSetTranslationUtils;
const Territory2Utils = metadata.Territory2Utils;
const Territory2ModelUtils = metadata.Territory2ModelUtils;
const Territory2RuleUtils = metadata.Territory2RuleUtils;
const TranslationsUtils = metadata.TranslationsUtils;
const WorkflowUtils = metadata.WorkflowUtils;

exports.run = function (fileUri) {
    try {
        let filePath;
        if (fileUri) {
            filePath = fileUri.fsPath;
        } else {
            let editor = window.activeTextEditor;
            if (editor)
                filePath = editor.document.uri.fsPath;
        }
        if (filePath && filePath.endsWith('.xml') && filePath.indexOf('force-app') != -1)
            compressFile(filePath);
        else
            window.showErrorMessage("The selected file isn't a XML Salesforce project file");
    } catch (error) {
        window.showErrorMessage('An error ocurred while processing command. Error: \n' + error);
    }
}

function compressFile(filePath) {
    let editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === filePath) {
        compress(filePath, editor);
    } else {
        window.showTextDocument(Paths.asUri(filePath)).then((editor) => compress(filePath, editor));
    }
}

function compress(filePath, editor) {
    let root = AuraParser.parseXML(FileReader.readFileSync(filePath), true);
    let content;
    if (root.AnalyticSnapshot)
        content = AnalyticSnapshotUtils.toXML(AnalyticSnapshotUtils.createAnalyticSnapshot(root.AnalyticSnapshot), true);
    else if (root.ApexTestSuite)
        content = ApexTestSuiteUtils.toXML(ApexTestSuiteUtils.createApexTestSuite(root.ApexTestSuite), true);
    else if (root.AppMenu)
        content = AppMenuUtils.toXML(AppMenuUtils.createAppMenu(root.AppMenu), true);
    else if (root.ApprovalProcess)
        content = ApprovalProcessUtils.toXML(ApprovalProcessUtils.createApprovalProcess(root.ApprovalProcess), true);
    else if (root.AssignmentRules)
        content = AssignmentRulesUtils.toXML(AssignmentRulesUtils.createAssignmentRules(root.AssignmentRules), true);
    else if (root.Audience)
        content = AudienceUtils.toXML(AudienceUtils.createAudience(root.Audience), true);
    else if (root.AutoResponseRules)
        content = AutoResponseRulesUtils.toXML(AutoResponseRulesUtils.createAutoResponseRules(root.AutoResponseRules), true);
    else if (root.Bot)
        content = BotUtils.toXML(BotUtils.createBot(root.Bot), true);
    else if (root.BrandingSet)
        content = BrandingSetUtils.toXML(BrandingSetUtils.createBrandingSet(root.BrandingSet), true);
    else if (root.CallCenter)
        content = CallCenterUtils.toXML(CallCenterUtils.createCallCenter(root.CallCenter), true);
    else if (root.CleanDataService)
        content = CleanDataServiceUtils.toXML(CleanDataServiceUtils.createCleanDataService(root.CleanDataService), true);
    else if (root.CMSConnectSource)
        content = CMSConnectSourceUtils.toXML(CMSConnectSourceUtils.createCMSConnectSource(root.CMSConnectSource), true);
    else if (root.Community)
        content = CommunityZoneUtils.toXML(CommunityZoneUtils.createCommunityZone(root.Community), true);
    else if (root.CommunityTemplateDefinition)
        content = CommunityTemplateDefinitionUtils.toXML(CommunityTemplateDefinitionUtils.createCommunityTemplateDefinition(root.CommunityTemplateDefinition), true);
    else if (root.CommunityThemeDefinition)
        content = CommunityThemeDefinitionUtils.toXML(CommunityThemeDefinitionUtils.createCommunityThemeDefinition(root.CommunityThemeDefinition), true);
    else if (root.ConnectedApp)
        content = ConnectedAppUtils.toXML(ConnectedAppUtils.createConnectedApp(root.ConnectedApp), true);
    else if (root.ContentAsset)
        content = ContentAssetUtils.toXML(ContentAssetUtils.createContentAsset(root.ContentAsset), true);
    else if (root.CustomApplication)
        content = CustomApplicationUtils.toXML(CustomApplicationUtils.createCustomApplication(root.CustomApplication), true);
    else if (root.CustomFeedFilter)
        content = CustomFeedFilterUtils.toXML(CustomFeedFilterUtils.createCustomFeedFilter(root.CustomFeedFilter), true);
    else if (root.CustomHelpMenuSection)
        content = CustomHelpMenuSectionUtils.toXML(CustomHelpMenuSectionUtils.createCustomHelpMenuSection(root.CustomHelpMenuSection), true);
    else if (root.CustomLabels)
        content = CustomLabelsUtils.toXML(CustomLabelsUtils.createCustomLabels(root.CustomLabels), true);
    else if (root.CustomMetadata)
        content = CustomMetadataUtils.toXML(CustomMetadataUtils.createCustomMetadata(root.CustomMetadata), true);
    else if (root.CustomObject)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createCustomObject(root.CustomObject), true, 'CustomObject');
    else if (root.BusinessProcess)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createBussinesProcess(root.BusinessProcess), true, 'BusinessProcess');
    else if (root.CompactLayout)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createCompactLayout(root.CompactLayout), true, 'CompactLayout');
    else if (root.CustomField)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createCustomField(root.CustomField), true, 'CustomField');
    else if (root.Index)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createIndex(root.Index), true, 'Index');
    else if (root.ListView)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createListView(root.ListView), true, 'ListView');
    else if (root.RecordType)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createRecordType(root.RecordType), true, 'RecordType');
    else if (root.ValidationRule)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createValidationRule(root.ValidationRule), true, 'ValidationRule');
    else if (root.WebLink)
        content = CustomObjectUtils.toXML(CustomObjectUtils.createWebLink(root.WebLink), true, 'WebLink');
    else if (root.CustomObjectTranslation)
        content = CustomObjectTranslationUtils.toXML(CustomObjectTranslationUtils.createCustomObjectTranslation(root.CustomObjectTranslation), true);
    else if (root.CustomPermission)
        content = CustomPermissionUtils.toXML(CustomPermissionUtils.createCustomPermission(root.CustomPermission), true);
    else if (root.CustomSite)
        content = CustomSiteUtils.toXML(CustomSiteUtils.createCustomSite(root.CustomSite), true);
    else if (root.CustomTab)
        content = CustomTabUtils.toXML(CustomTabUtils.createCustomTab(root.CustomTab), true);
    else if (root.Dashboard)
        content = DashboardUtils.toXML(DashboardUtils.createDashboard(root.Dashboard), true);
    else if (root.DuplicateRule)
        content = DuplicateRuleUtils.toXML(DuplicateRuleUtils.createDuplicateRule(root.DuplicateRule), true);
    else if (root.EclairGeoData)
        content = EclairGeoDataUtils.toXML(EclairGeoDataUtils.createEclairGeoData(root.EclairGeoData), true);
    else if (root.EmailServicesFunction)
        content = EmailServicesFunctionUtils.toXML(EmailServicesFunctionUtils.createEmailServicesFunction(root.EmailServicesFunction), true);
    else if (root.EmailTemplate)
        content = EmailTemplateUtils.toXML(EmailTemplateUtils.createEmailTemplate(root.EmailTemplate), true);
    else if (root.EmbeddedServiceConfig)
        content = EmbeddedServiceConfigUtils.toXML(EmbeddedServiceConfigUtils.createEmbeddedServiceConfig(root.EmbeddedServiceConfig), true);
    else if (root.EmbeddedServiceLiveAgent)
        content = EmbeddedServiceLiveAgentUtils.toXML(EmbeddedServiceLiveAgentUtils.createEmbeddedServiceLiveAgent(root.EmbeddedServiceLiveAgent), true);
    else if (root.EntitlementProcess)
        content = EntitlementProcessUtils.toXML(EntitlementProcessUtils.createEntitlementProcess(root.EntitlementProcess), true);
    else if (root.EscalationRules)
        content = EscalationRulesUtils.toXML(EscalationRulesUtils.createEscalationRules(root.EscalationRules), true);
    else if (root.EventDelivery)
        content = EventDeliveryUtils.toXML(EventDeliveryUtils.createEventDelivery(root.EventDelivery), true);
    else if (root.EventSubscription)
        content = EventSubscriptionUtils.toXML(EventSubscriptionUtils.createEventSubscription(root.EventSubscription), true);
    else if (root.ExternalDataSource)
        content = ExternalDataSourceUtils.toXML(ExternalDataSourceUtils.createExternalDataSource(root.ExternalDataSource), true);
    else if (root.FlexiPage)
        content = FlexiPageUtils.toXML(FlexiPageUtils.createFlexiPage(root.FlexiPage), true);
    else if (root.FlowCategory)
        content = FlowCategoryUtils.toXML(FlowCategoryUtils.createFlowCategory(root.FlowCategory), true);
    else if (root.GlobalPicklist)
        content = GlobalPicklistUtils.toXML(GlobalPicklistUtils.createGlobalPicklist(root.GlobalPicklist), true);
    else if (root.GlobalValueSet)
        content = GlobalValueSetUtils.toXML(GlobalValueSetUtils.createGlobalValueSet(root.GlobalValueSet), true);
    else if (root.GlobalValueSetTranslation)
        content = GlobalValueSetTranslationUtils.toXML(GlobalValueSetTranslationUtils.createGlobalValueSetTranslation(root.GlobalValueSetTranslation), true);
    else if (root.KeywordList)
        content = KeywordListUtils.toXML(KeywordListUtils.createKeywordList(root.KeywordList), true);
    else if (root.Layout)
        content = LayoutUtils.toXML(LayoutUtils.createLayout(root.Layout), true);
    else if (root.LightningBolt)
        content = LightningBoltUtils.toXML(LightningBoltUtils.createLightningBolt(root.LightningBolt), true);
    else if (root.LightningMessageChannel)
        content = LightningMessageChannelUtils.toXML(LightningMessageChannelUtils.createLightningMessageChannel(root.LightningMessageChannel), true);
    else if (root.ManagedContentType)
        content = ManagedContentTypeUtils.toXML(ManagedContentTypeUtils.createManagedContentType(root.ManagedContentType), true);
    else if (root.MatchingRules)
        content = MatchingRulesUtils.toXML(MatchingRulesUtils.createMatchingRules(root.MatchingRules), true);
    else if (root.MlDomain)
        content = MlDomainUtils.toXML(MlDomainUtils.createMlDomain(root.MlDomain), true);
    else if (root.ModerationRule)
        content = ModerationRuleUtils.toXML(ModerationRuleUtils.createModerationRule(root.ModerationRule), true);
    else if (root.NavigationMenu)
        content = NavigationMenuUtils.toXML(NavigationMenuUtils.createNavigationMenu(root.NavigationMenu), true);
    else if (root.PathAssistant)
        content = PathAssistantUtils.toXML(PathAssistantUtils.createPathAssistant(root.PathAssistant), true);
    else if (root.PermissionSet)
        content = PermissionSetUtils.toXML(PermissionSetUtils.createPermissionSet(root.PermissionSet), true);
    else if (root.PlatformCachePartition)
        content = PlatformCachePartitionUtils.toXML(PlatformCachePartitionUtils.createPlatformCachePartition(root.PlatformCachePartition), true);
    else if (root.PlatformEventChannel)
        content = PlatformEventChannelUtils.toXML(PlatformEventChannelUtils.createPlatformEventChannel(root.PlatformEventChannel), true);
    else if (root.Profile)
        content = ProfileUtils.toXML(ProfileUtils.createProfile(root.Profile), true);
    else if (root.QuickAction)
        content = QuickActionUtils.toXML(QuickActionUtils.createQuickAction(root.QuickAction), true);
    else if (root.Report)
        content = ReportUtils.toXML(ReportUtils.createReport(root.Report), true);
    else if (root.ReportType)
        content = ReportTypeUtils.toXML(ReportTypeUtils.createReportType(root.ReportType), true);
    else if (root.SharingSet)
        content = SharingSetUtils.toXML(SharingSetUtils.createSharingSet(root.SharingSet), true);
    else if (root.StandardValueSetTranslation)
        content = StandardValueSetTranslationUtils.toXML(StandardValueSetTranslationUtils.createStandardValueSetTranslation(root.StandardValueSetTranslation), true);
    else if (root.Territory2)
        content = Territory2Utils.toXML(Territory2Utils.createTerritory2(root.Territory2), true);
    else if (root.Territory2Model)
        content = Territory2ModelUtils.toXML(Territory2ModelUtils.createTerritory2Model(root.Territory2Model), true);
    else if (root.Territory2Rule)
        content = Territory2RuleUtils.toXML(Territory2RuleUtils.createTerritory2Rule(root.Territory2Rule), true);
    else if (root.Translations)
        content = TranslationsUtils.toXML(TranslationsUtils.createTranslations(root.Translations), true);
    else if (root.Workflow)
        content = WorkflowUtils.toXML(WorkflowUtils.createWorkflow(root.Workflow), true);

    if (content) {
        let replaceRange = new Range(0, 0, editor.document.lineCount - 1, editor.document.lineAt(editor.document.lineCount - 1).range.end.character);
        FileWriter.replaceEditorContent(editor, replaceRange, content);
        editor.revealRange(editor.document.lineAt(0).range);
    } else {
        window.showInformationMessage("The selected file not support XML compression");
    }
}