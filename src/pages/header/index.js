import React, { Component } from 'react';
import { Layout, Button, Menu, Dropdown, Icon } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { connect }from 'react-redux';
import creatHistory from 'history/createBrowserHistory'

import * as bcUtils from '../../bc/bcUtils';

const history = creatHistory();

class Header extends Component {

  componentDidMount(){
    this.props.checkLogin();
  }

  render(){
    const {account, login, goBack } = this.props;
    return (
      <Layout.Header>
        <div className='logo'>
          <img src='/pics/nav-logo.png' alt='goBack'onClick={goBack}/>
        </div>
        {
          account ? this.getDropDown(account) :
            <Button type='primary' className='nav-btn' onClick={login}>Login</Button>
        }
        <Menu
          theme='dark'
          mode='horizontal'
          defaultSelectedKeys={[this.props.location.pathname]}
          style={{lineHeight: '64px'}}
        >
          <Menu.Item key='/'><Link to='/'>Credentials</Link></Menu.Item>
          <Menu.Item key='/category/1'><Link to='/category/1'>Certificate type 1</Link></Menu.Item>
          <Menu.Item key='/category/2'><Link to='/category/2'>Certificate type 2</Link></Menu.Item>
          <Menu.Item key='/category/3'><Link to='/category/3'>Certificate type 3</Link></Menu.Item>
          <Menu.Item key='/category/4'><Link to='/category/4'>Certificate type 4</Link></Menu.Item>
          <Menu.Item key='/category/5'><Link to='/category/5'>Certificate type 5</Link></Menu.Item>
          <Menu.Item key='/category/6'><Link to='/category/6'>Certificate type 6</Link></Menu.Item> 
        </Menu>
      </Layout.Header>
    );
  }

  getDropDown(text){
    const menu = (
      <Menu>
        <Menu.Item onClick={this.props.logout}>Logout</Menu.Item>
        <Menu.Item><Link to='/create'>Create</Link></Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu} className='nav-menu fr'>
        <a className='ant-dropdown-link' href='#a'>{text}<Icon type='down' />
        </a>
      </Dropdown>
    );
  }
}

const mapState = (state) => ({
  account: state.account,
});

const mapDispatch = (dispatch) => ({
  checkLogin(){
    dispatch(bcUtils.checkLogin());
  },
  login(){
    dispatch(bcUtils.login());
  },
  logout(){
    dispatch(bcUtils.logout());
  },
  goBack(){
    history.goBack();
  },
});

export default connect(mapState, mapDispatch)(withRouter(Header));
