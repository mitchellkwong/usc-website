import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { compose } from 'redux'
import { connect } from 'react-redux'
import {
  Container, Row, Col, Button,
  Modal, ModalBody, ModalFooter
} from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import EventForm from './EventForm'
import { getUserEvents, updateEvent, deleteEvent, getGroups } from '../../utils/actions'
import { formatEvents } from '../../utils/utils'
import { firebaseConnect, isLoaded, isEmpty } from 'react-redux-firebase';
import { withRouter } from 'react-router-dom'

class EditEvent extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      eventID: this.props.match.params.eventID,
      successModal: false,
      deleteModal: false,
    }
  }

  componentWillMount() {
    const { firestore } = this.context.store
    const { auth, history } = this.props

    if(isLoaded(auth) && !isEmpty(auth)) {
      getUserEvents(firestore, auth.uid, (snapshot) => {
        if (snapshot.empty) {
          history.push('/manageevents')
        }
      })
    }

    getGroups(firestore, () => {})
  }

  componentWillReceiveProps(nextProps) {
    const { firestore } = this.context.store
    const { auth } = this.props

    if(!isLoaded(auth) && isLoaded(nextProps.auth) && !isEmpty(nextProps.auth)) {
      getUserEvents(firestore, nextProps.auth.uid)
    }
  }

  updateEvent = (event, callback, clearSubmitting) => {
    const { auth, firebase, spacesUnordered } = this.props
    const { firestore } = this.context.store

    updateEvent(firestore, firebase, event, auth.uid, spacesUnordered, (event) => {
      this.toggle('success')
      clearSubmitting(event)
    })
  }

  deleteEvent = (event, callback, clearSubmitting) => {
    const { firebase } = this.props
    const { firestore } = this.context.store

    deleteEvent(firestore, firebase, event, callback)
  }

  toggle = (type) => {
    switch(type) {
      case 'success':
        this.setState({
          successModal: !this.state.successModal
        });
        break
      case 'delete':
        this.setState({
          deleteModal: !this.state.deleteModal
        });
        break
      default:
        break
    }
  }

  successModal = () => {
    const { successModal } = this.state
    const { history } = this.props

    return(<Modal isOpen={successModal} toggle={this.toggle}>
      <ModalBody>
        <h3 style={{fontWeight: 300}}>Event Updated!</h3>
        <p>Your event has been successfully updated!</p>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={() => history.push('/manageevents')}>Manage Events</Button>{' '}
        <Button color="secondary" onClick={() => {
          this.toggle('success')
        }}>Dismiss</Button>
      </ModalFooter>
    </Modal>)
  }

  deleteModal = () => {
    const { deleteModal, eventID } = this.state
    const { history, userEvents } = this.props

    return(<Modal isOpen={deleteModal} toggle={this.toggle}>
      <ModalBody>
        <h3 style={{fontWeight: 300}}>Do You Want To Delete?</h3>
        <p>Please confirm that you would like to delete this event?</p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={() => {
          this.toggle('delete')
        }}>Cancel</Button>
        <Button color="danger" onClick={() => this.deleteEvent(userEvents[eventID], () => history.push('/manageevents'))}><FontAwesomeIcon icon="trash-alt" />{' '} Confirm Deletion</Button>{' '}
      </ModalFooter>
    </Modal>)
  }

  render() {
    const { eventID } = this.state
    const { firestore } = this.context.store
    const { auth, eventTypes, spaces, userEvents, firebase, userEventsOriginal,
      history, groups, groupTypes, groupsUnordered, venueBookings } = this.props

    if(isLoaded(auth) && isEmpty(auth)){
      history.push('/')
    } else if (isLoaded(userEventsOriginal) && (!userEventsOriginal || (userEventsOriginal && !userEventsOriginal[eventID]))) {
      history.push('/manageevents')
    }

    return(
    <Container>
      { this.successModal() }
      { this.deleteModal() }
      <Row>
        <Col>
          <h1 className="display-3">Edit Event</h1>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          {
            isLoaded(eventTypes) && isLoaded(spaces) && userEvents[eventID] && groups && groupTypes ?
              <div>
                <EventForm
                  event={userEvents[eventID]}
                  eventTypes={eventTypes}
                  spaces={spaces}
                  buttonText='Save Changes'
                  buttonOnSubmit={(event, callback, clearSubmitting) => this.updateEvent(event, callback, clearSubmitting)}
                  venueBookings={venueBookings}
                  firebase={firebase}
                  firestore={firestore}
                  groups={groups}
                  groupsUnordered={groupsUnordered}
                  groupTypes={groupTypes} />
                <div className="d-flex justify-content-center">
                  <Button className="w-75" color="danger" onClick={() => this.toggle('delete')} block disabled={!window.gapi.client}>
                    { !window.gapi.client ? <FontAwesomeIcon icon="spinner" spin /> : '' } <FontAwesomeIcon icon="trash-alt" />{' '}Delete Event
                  </Button>
                </div>
                <div className="d-flex justify-content-center">
                  <Button className="w-75 mt-3" color="secondary" onClick={() => history.push('/manageevents')} outline block>
                    Back to Manage Events
                  </Button>
                </div>
              </div>
            : <h4><FontAwesomeIcon icon="spinner" spin /> Please wait...</h4>
          }
        </Col>
      </Row>
    </Container>)
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
    userEvents: formatEvents(state.firestore, 'userEvents', false),
    userEventsOriginal: state.firestore.data.userEvents,
    eventTypes: state.firestore.ordered.eventTypes,
    spaces: state.firestore.ordered.spaces,
    spacesUnordered: state.firestore.data.spaces,
    groups: state.firestore.ordered.groups,
    groupsUnordered: state.firestore.data.groups,
    groupTypes: state.firestore.data.groupTypes,
    venueBookings: state.firestore.ordered.venueBookings
  }
}

export default withRouter(compose(
  firebaseConnect(),
  connect(mapStateToProps)
)(EditEvent))
