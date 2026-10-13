import { ConfigProvider } from 'antd';
import { appTheme } from './theme';
import { useEffect, useMemo, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import WhatsAppFloat from './comps/whatsappFloat/main';
import WorkspaceGuard from './comps/WorkspaceGuard';
import { trackPageView } from './funcs/metaPixel';
import getActiveUserId from './funcs/getActiveUserId';
import Loading from './comps/Loading';
import './App.css';
import './index.css';


const Home = lazy(() => import('./pages/home/main'));
const HomeV2 = lazy(() => import('./pages/homev2/main'));
const Automations = lazy(() => import('./pages/automate/main'));
const Signup = lazy(() => import('./pages/login/main'));
const InstaAccounts = lazy(() => import('./pages/instaAccounts/main'));
const SignupTwo = lazy(() => import('./pages/signup/main'));
const Oia = lazy(() => import('./pages/oia/main'));

const FbRdr = lazy(() => import('./pages/fb-redirect/main'));
const FbAPIRdr = lazy(() => import('./pages/fb-api-redirect/main'));
const ResetPassword = lazy(() => import('./pages/reset-password/main'));
const YT = lazy(() => import('./pages/yt-automation/main'));
const InboxAutomation = lazy(() => import('./pages/inbox-automation/main'));
const LinkExtract = lazy(() => import('./pages/linkExtract/main'));
// import Shop from './pages/shop/main';
const CollectMoney = lazy(() => import('./pages/collect-amount/main'));
const FlowComp = lazy(() => import('./pages/flow-automte/main'));
const AutomationList = lazy(() => import('./pages/automationList/main'));
const FlowListPageV2 = lazy(() => import('./pages/flow-v2/list/FlowListPage'));
const FlowEditorPageV2 = lazy(() => import('./pages/flow-v2/editor/FlowEditorPage'));
const ContactsPageV2 = lazy(() => import('./pages/contacts-v2/main'));
const PagesListPage = lazy(() => import('./pages/instant-pages/list/PagesListPage'));
const PageEditorPage = lazy(() => import('./pages/instant-pages/editor/PageEditorPage'));
const PageViewerPage = lazy(() => import('./pages/instant-pages/viewer/PageViewerPage'));
// Instant Pages is not released yet: its routes exist in local dev only, and in a
// production build only when REACT_APP_INSTANT_PAGES=true is set at build time.
const INSTANT_PAGES_ENABLED =
  process.env.NODE_ENV !== 'production' || process.env.REACT_APP_INSTANT_PAGES === 'true';
const QuickDM = lazy(() => import('./pages/quick-dm/main'));

const RefferalList = lazy(() => import('./pages/referal_board/main'));
const LinkedIn = lazy(() => import('./pages/linkedin/main'));

const SellMain = lazy(() => import('./sell_pages/main/main'));
const Courses = lazy(() => import('./pages/courses/main'));
const CoursePurchaseFlow = lazy(() => import('./pages/course_client_side/main'));
const InsightsPage = lazy(() => import('./pages/insights/main'));
const DigitalProducts = lazy(() => import('./pages/digital-products/main'));
const DigitalPurchaseFlow = lazy(() => import('./pages/digital_product_client_side/main'));
const Shopify = lazy(() => import('./pages/shopify/main'));
const SPConnectAPP = lazy(() => import('./pages/shopify-connect-app/main'));
const SPRDR = lazy(() => import('./pages/shopify-redirect/main'));
const SPLOGIN = lazy(() => import('./pages/shopify-login/main'));
const IGAUTHAPP = lazy(() => import('./pages/ig-auth-app/main'));

const TempReport = lazy(() => import('./pages/temp-report/main'));
const FBHome = lazy(() => import('./pages/fb-home/main'));
const MessengerPage = lazy(() => import('./pages/messagner/main'));
const InstagramPostUploader = lazy(() => import('./pages/later/mani'));
const WelcomeOnboardingPage = lazy(() => import('./pages/welcome/main'));
const CollabInvite = lazy(() => import('./pages/collab-invite/main'));
const StripeSuccess = lazy(() => import('./pages/stripe-success/main'));
const StripeFailure = lazy(() => import('./pages/stripe-failure/main'));
const NotFound = lazy(() => import('./pages/not-found/main'));
const NotFoundPage = lazy(() => import('./pages/not-found/main'));
const SharedFlowPage = lazy(() => import('./pages/shared-flow/main'));
const TeamInvite = lazy(() => import('./pages/team-invite/main'));
const WorkspacePicker = lazy(() => import('./pages/workspace-picker/main'));
const ApiIntegration = lazy(() => import('./pages/make-integration/main'));
const ApiLogs = lazy(() => import('./pages/api-logs/main'));
const TeamSettings = lazy(() => import('./pages/team-settings/main'));
const Invoices = lazy(() => import('./pages/invoices/main'));
const TestMailchimpFlow = lazy(() => import('./pages/test-mailchimp/main'));
const Health = lazy(() => import('./pages/health/main'));
const AutomationRecovery = lazy(() => import('./pages/automation-recovery/main'));
const SocialRedirect = lazy(() => import('./pages/social-rdr/main'));
const ShareLogin = lazy(() => import('./pages/share-login/main'));
const OAuthAuthorize = lazy(() => import('./pages/oauth-authorize/main'));





// Honour the OS "reduce motion" setting (Windows: Settings > Accessibility >
// Visual effects > Animation effects) through antd's own `motion` seed token.
//
// Do NOT do this with a blanket `*  { animation-duration: 0.01ms !important }`
// CSS rule: a near-zero duration lets rc-trigger measure a popup while it is
// still mid-zoom, so its derived scale factor is fractional and the offset it
// divides by that scale is inflated - popups render correctly but land
// thousands of px off-screen. `motion: false` removes the animation outright,
// so alignment always measures an untransformed element.
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    // Safari < 14 only has the deprecated addListener/removeListener pair.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
}

function App() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const theme = useMemo(
    () => (prefersReducedMotion
      ? { ...appTheme, token: { ...appTheme.token, motion: false } }
      : appTheme),
    [prefersReducedMotion]
  );

  // Firebase custom-token sign-in is paused until the RN app is updated.
  // useEffect(() => {
  //   if (isWebClient()) ensureFirebaseAuth();
  // }, [location.pathname]);

  // Track page views on route changes for Meta Pixel
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  useEffect(() => {

    try {
      let user_id = getActiveUserId(true)
      if (user_id) {
        window.clarity("identify", user_id);
      }
    }
    catch (err) {
      console.log("error in user details", err)
    }

  })

  // Hide Crisp chat widget on messenger routes
  useEffect(() => {
    const messengerRoutes = ['/messenger', '/msg'];
    const isMessenger = messengerRoutes.includes(location.pathname);
    if (window.$crisp) {
      if (isMessenger) {
        window.$crisp.push(['do', 'chat:hide']);
      } else {
        window.$crisp.push(['do', 'chat:show']);
      }
    }
  }, [location.pathname]);

  return (
    <ConfigProvider theme={theme}>
      <div className="App" style={['/messenger', '/msg'].includes(location.pathname) ? { overflow: 'hidden', height: '100vh' } : {}}>

        <WorkspaceGuard>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Signup />} />
            <Route path="/ig-connect" element={<SignupTwo />} />
            <Route path="/fb-rdr" element={<FbAPIRdr />} />
            <Route path="/fb-api-rdr" element={<FbAPIRdr />} />
            <Route path="/ig_auth_app" element={<IGAUTHAPP />} />
            <Route path="/insta-accounts" element={<InstaAccounts />} />
            <Route path='/' element={<WelcomeOnboardingPage />} />
            <Route path='/fb' element={<FBHome />} />

            <Route path="/ig" element={<HomeV2 />} />
            <Route path="/temp-report" element={<TempReport />} />
            <Route path="/dashboard" element={<InsightsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path='/messenger' element={<MessengerPage />} />

            {/* <Route path="/home" element={<Home />} /> */}
            <Route path="/manage-post/:id" element={<Automations />} />
            <Route path="/oia" element={<Oia />} />
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path="/yt" element={<YT />} />
            <Route path="/inbox-automation" element={<InboxAutomation />} />
            <Route path="/le" element={<LinkExtract />} />
            {/* <Route path="/shop2" element={<Shop/>} /> */}
            <Route path="/shop" element={<SellMain />} />

            <Route path="/shopify" element={<Shopify />} />
            <Route path="/connect-shopify-store" element={<SPConnectAPP />} />
            <Route path="/shopfy-rdr" element={<SPRDR />} />
            <Route path="/shopfy-login" element={<SPLOGIN />} />

            <Route path="/cm" element={<CollectMoney />} />
            <Route path="/flow" element={<FlowComp />} />
            <Route path="/automation-list" element={<AutomationList />} />
            <Route path="/flow-v2" element={<FlowListPageV2 />} />
            <Route path="/flow-v2/editor" element={<FlowEditorPageV2 />} />
            {INSTANT_PAGES_ENABLED && (<>
              <Route path="/pages" element={<PagesListPage />} />
              <Route path="/pages/editor" element={<PageEditorPage />} />
              <Route path="/p/:id" element={<PageViewerPage />} />
              <Route path="/u/:handle" element={<PageViewerPage />} />
            </>)}
            <Route path="/contacts" element={<ContactsPageV2 />} />
            <Route path="/contacts-v2" element={<ContactsPageV2 />} />
            <Route path="/quick-dm" element={<QuickDM />} />
            <Route path="/quick-dm/:id" element={<QuickDM />} />
            <Route path="/referral-dashboard" element={<RefferalList />} />

            <Route path="/linkedin" element={<LinkedIn />} />
            <Route path='/courses' element={<Courses />} />
            <Route path='/digital-products' element={<DigitalProducts />} />
            <Route path='/course/id' element={<CoursePurchaseFlow />} />
            <Route path='/dp/:id' element={<DigitalPurchaseFlow />} />
            <Route path='/msg' element={<MessengerPage />} />
            <Route path='/later' element={<InstagramPostUploader />} />
            <Route path="/c/:id" element={<CollabInvite />} />
            <Route path="/connect/:id" element={<ShareLogin />} />
            <Route path="/shared-flow/:id" element={<SharedFlowPage />} />
            <Route path="/stripe-success" element={<StripeSuccess />} />
            <Route path="/stripe-failure" element={<StripeFailure />} />

            <Route path="/collab-order-success" element={<StripeSuccess />} />
            <Route path="/collab-order-cancel" element={<StripeFailure />} />

            <Route path="/api-integration" element={<ApiIntegration />} />
            <Route path="/oauth/authorize" element={<OAuthAuthorize />} />
            <Route path="/api-logs" element={<ApiLogs />} />
            <Route path="/test-mailchimp" element={<TestMailchimpFlow />} />
            {/* <Route path="/health" element={<Health />} /> */}
            <Route path="/automation-recovery" element={<AutomationRecovery />} />
            {/* Old split routes — kept so existing links and the post deep-link
                (?post_id=) keep working, now landing on the matching tab. */}
            <Route path="/missed-automations" element={<AutomationRecovery />} />
            <Route path="/comment-polling" element={<Navigate to="/automation-recovery?tab=pooling" replace />} />

            <Route path="/social-rdr" element={<SocialRedirect />} />

            {/* 404 - Catch all unknown routes */}
            <Route path="*" element={<NotFoundPage />} />

            <Route path="/team-settings" element={<TeamSettings />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/team-invite/:token" element={<TeamInvite />} />
            <Route path="/workspace-picker" element={<WorkspacePicker />} />

          </Routes>
        </Suspense>
        </WorkspaceGuard>

        {/* {!['/messenger', '/msg'].includes(location.pathname) && <WhatsAppFloat />} */}
      </div>
    </ConfigProvider>
  );
}

export default App;
