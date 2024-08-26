import React, { lazy } from 'react'
import { Switch, Route, useRouteMatch, Link } from 'react-router-dom'
import { Result } from 'antd'
import { UsergroupAddOutlined } from '@ant-design/icons'
import Icon from '@ant-design/icons/lib/components/Icon'

import { USERS_COLUMNS } from '@shared/constants'
import { ReactComponent as UsersIcon } from '@assets/Users.svg'
import { getUsers } from '@redux/user/userThunk'
import { selectAllUsers } from '@redux/user/userSlice'

const DataOverviewPage = lazy(() => import('@pages/DataOverviewPage/index'))
const AddNewUserPage = lazy(() => import('@pages/AddNewUserPage/index'))
const UpdateUserPage = lazy(() => import('@pages/UpdateUserPage/index'))

const UsersOutlined = props => <Icon {...props} component={UsersIcon} />

const UsersPage = () => {
  let { path } = useRouteMatch()

  if (path.endsWith('/*')) {
    path = path.slice(0, -2)
  }

  return (
    <Switch>
      <Route
        exact
        path={path}
        render={routeProps => (
          <DataOverviewPage
            {...routeProps}
            title={
              <>
                <UsersOutlined
                  style={{
                    marginRight: '0.3rem',
                    display: 'inline-flex',
                    fontSize: '2rem',
                    fontWeight: '700',
                  }}
                />
                Users
              </>
            }
            addNewIcon={<UsergroupAddOutlined />}
            dataAbout='user'
            columns={USERS_COLUMNS}
            action={getUsers}
            selector={selectAllUsers}
          />
        )}
      />
      <Route exact path={`${path}/create`} component={AddNewUserPage} />
      <Route
        exact
        path={`${path}/:uid/:activeTab?`}
        component={UpdateUserPage}
      />
      <Route
        path='*'
        render={() => (
          <Result
            style={{ margin: 'auto' }}
            status={404}
            title={
              <>
                <strong>404</strong>
                <p>Page Not Found</p>
              </>
            }
            subTitle="The page you are looking for doesn't exists."
            extra={<Link to='/admin/users'>Back to Users</Link>}
          />
        )}
      />
    </Switch>
  )
}

export default UsersPage
