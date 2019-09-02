import React, { Component, Fragment } from 'react';
import { List, Avatar } from 'antd';

import * as bcUtils from '../../bc/bcUtils';
import * as utils from '../../bc/utils';

class Detail extends Component {

  state = {
    title: '',
    content: '',
    author: '',
    timestamp: 0,
    cover: '',
  }

  componentDidMount(){
    bcUtils.eosTableRowById('article', this.props.match.params.id, async (res) => {
      const content = await bcUtils.readTextFromIPFS(res.content);
      this.setState({
        content,
        title: res.title,
        author: res.author,
        timestamp: res.timestamp,
        cover: res.cover,
      });
    });
  }

  render(){
    const { title, content, author, timestamp, cover } = this.state;

    return (
      <Fragment>
        <div className='article-title'>
          <h3>{title}</h3>
          <List.Item.Meta
            title={author}
            description={utils.getFormatTime(parseInt(timestamp))}
          />
        </div>
        <div dangerouslySetInnerHTML={{__html:content}}></div>
        <div>{<img src={bcUtils.ipfsUrl(cover)} />}</div>
      </Fragment>
    );
  }
}

export default Detail;