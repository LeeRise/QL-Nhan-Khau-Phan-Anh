
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import Header from './Header'
import Main from './main'
import Login from './account/login'
import LoginA from './admin/login_a'
import PublicRoute1 from './admin/PublicRoute1'
import CapQuyen from './admin/phanQuyen'
import ProtectedRoute from './admin/ProtectRoute'
import ForgotPassword from './account/forgot'
import PublicRoute from './account/PublicRoute'
import ProtectedRouteU from './protectRoute'
import ChangePassword from './account/change'
import Header1 from './headerAdmin'
import PersonalProfile from './user/nhankhau'
import HouseholdProfile from './user/hokhau'
import CreatePhanAnh from './user/createPhananh'
import PhanAnhHistory from './user/lichsuphananh'
import SearchPage from './canboPhanAnh/thongkePhanhanh'
import AdminResponsePage from './canboPhanAnh/phanhoi'
import HouseholdSearch from './QL_Nhan_Khau/searchHoKhau'
import ManagementPage from './QL_Nhan_Khau/hokhau'
import RegisterHousehold from './QL_Nhan_Khau/dangkiKhau'
import SplitHousehold from './QL_Nhan_Khau/tachKhau'
import MoveEntireHouseholdPage from './QL_Nhan_Khau/chuyenHo'
import AddMemberPage from './QL_Nhan_Khau/themTv'
import UpdateMemberPage from './QL_Nhan_Khau/updateInfor'
import MemberDeparturePage from './QL_Nhan_Khau/chuyenNK'
import ResidenceManagement from './QL_Nhan_Khau/tam'
import ThongKePage from './QL_Nhan_Khau/thongke'
import DemographicStats from './QL_Nhan_Khau/thongke1'
import ResidenceFluctuationPage from './QL_Nhan_Khau/thongke2'
const router = createBrowserRouter([
  {
    path:'/',
    element: <Header/>,
    children: [
      {
        index: true,
        element: <Main/>
      },
      {
        element: <PublicRoute/>,
        children: [
          {
            path: '/login',
            element: <Login/>
          },
          {
            path: '/forgotPassword',
            element: <ForgotPassword/>
          }
        ]
      },
      {
        element: <ProtectedRouteU/>,
        children: [
          {path: '/change-password',
            element: <ChangePassword/>
          },
          {
            path: '/profile',
            element: <PersonalProfile/>
          },
          {
            path: '/profile1',
            element: <HouseholdProfile/>
          },
          {
            path: '/phan-anh/them-moi',
            element: <CreatePhanAnh/>
          },
          {
            path: '/phan-anh/lich-su',
            element: <PhanAnhHistory/>
          },
          {
            path: '/can-bo/thay-doi-phan-anh',
            element: <AdminResponsePage/>
          },
          {
            path: '/can-bo/thong-ke-phan-anh',
            element: <SearchPage/>
          },
          {
            path: '/can-bo/thong-tin-ho-khau',
            element: <HouseholdSearch/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau',
            element: <ManagementPage/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/1',
            element: <RegisterHousehold/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/2',
            element: <SplitHousehold/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/3',
            element: <MoveEntireHouseholdPage/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/4',
            element: <AddMemberPage/>
              
          },
          {
            path: '/can-bo/thay-doi-ho-khau/5',
            element: <UpdateMemberPage/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/6',
            element: <MemberDeparturePage/>
          },
          {
            path: '/can-bo/thay-doi-ho-khau/7',
            element: <ResidenceManagement/>
          },
          {
            path: '/can-bo/thong-ke',
            element: <ThongKePage/>
          },
          {
            path: '/can-bo/thong-ke-nhan-khau',
            element: <DemographicStats/>
          },
          {
            path: '/can-bo/thong-ke-tam-tru/vang',
            element: <ResidenceFluctuationPage/>
          }

        ]
      }
    ]
  },
  {
    path: '/admin',
    element: <Header1/>,
    children: [
      {
        index: true,
        element: <Main/>,
      },
      {
        element: <PublicRoute1/>,
        children: [
          {
            path: 'login',
            element: <LoginA/>
          }
        ]
      },
      {
        element: <ProtectedRoute/>,
        children: [
          {
            path: 'cap-quyen',
            element: <CapQuyen/>
          }
        ]
      }
    ]


  }
  

])
function App() {
 

  return (
    
     <><RouterProvider router={router} /></>
  )
}

export default App
