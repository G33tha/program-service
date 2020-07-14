// import app from '../../app'

process.env.NODE_ENV = 'test'

const app = require('../../app')
const envVariables = require('../../envVariables')
const chai = require('chai')
const nock = require('nock');
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const { expect } = chai
const _ = require("lodash");

const programData = require('../testData/program.json')
const dummyData = require('../testData/dummyData');

// const host = 'http://localhost:5000'
const BASE_URL = '/program/v1'

// eslint-disable-next-line no-undef
describe('Program Service', () => {
  let programId;

  beforeEach(() => {
    nock(envVariables.OPENSABER_SERVICE_URL)
    .post('/search', dummyData.regUserSearch)
    .reply(200, {result: {User: [{name: 'sumi', userId: dummyData.nominationAdd.user_id}]}} )

    nock(envVariables.OPENSABER_SERVICE_URL)
    .post('/search', dummyData.regOrgSearch)
    .reply(200, {result: {Org: [{name: 'contributingOrg ABC', osid: dummyData.nominationAdd.organisation_id}]}} )
  });


  // eslint-disable-next-line no-undef
  it('it should GET all programs', (done) => {
    chai.request(app)
      .post(BASE_URL + '/list')
      .set('Accept', 'application/json')
      .send({
        request: {
          filters: {
            status: 'Live'
          }
        }
      })
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        if (!err) {
          expect(res.body.result).to.have.property('programs');
          expect(res.body.result.programs).to.be.a('array');
        }
        expect(res.status).to.equal(200)
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should create a programs', (done) => {
    const program = { request: programData }
    chai.request(app)
      .post(BASE_URL + '/create')
      .set('Accept', 'application/json')
      .send(program)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.have.property('program_id')
        programId = res.body.result.program_id;
        done()
      })
  })

  _.forEach(dummyData.mandatoryFieldsProgramCreate, field => {
    // eslint-disable-next-line no-undef
    it(`it should not create a program if ${field} is not sent`, (done) => {
      const reqData = JSON.stringify(programData)
      const program = { request: JSON.parse(reqData) }
      delete program.request[field]
      chai.request(app)
        .post(BASE_URL + '/create')
        .set('Accept', 'application/json')
        .send(program)
        // eslint-disable-next-line handle-callback-err
        .end((err, res) => {
          expect(res.status).to.equal(400)
          done()
        })
    })
  })

  // eslint-disable-next-line no-undef
  it('it should get program', (done) => {
    chai.request(app)
      .get(BASE_URL + '/read/' + programId)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should update a program', (done) => {
    const programUpdate = { request: dummyData.programUpdate }
    programUpdate.request.program_id = programId;
    chai.request(app)
      .post(BASE_URL + '/update')
      .set('Accept', 'application/json')
      .send(programUpdate)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        if (!programId) {
          expect(res.status).to.equal(400)
        } else {
          expect(res.status).to.equal(200)
        }
        done()
      })
  })

  _.forEach(dummyData.mandatoryFieldsProgramUpdate, field => {
    // eslint-disable-next-line no-undef
    it(`it should not update a program if ${field} is missing`, (done) => {
      const reqData = JSON.stringify(dummyData.programUpdate)
      const programUpdate = { request: JSON.parse(reqData) }
      programUpdate.request.program_id = programId;
      delete programUpdate.request[field]
      chai.request(app)
        .post(BASE_URL + '/update')
        .set('Accept', 'application/json')
        .send(programUpdate)
        // eslint-disable-next-line handle-callback-err
        .end((err, res) => {
            expect(res.status).to.equal(400)
          done()
        })
    })
  })

  // eslint-disable-next-line no-undef
  it('it should add a nomination', (done) => {
    const nominationAdd = { request: dummyData.nominationAdd }
    nominationAdd.request.program_id = programId
    chai.request(app)
      .post(BASE_URL + '/nomination/add')
      .set('Accept', 'application/json')
      .send(nominationAdd)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
  })

  _.forEach(dummyData.mandatoryFieldsNominationAdd, field => {
    // eslint-disable-next-line no-undef
    it(`it should not add a nomination if ${field} is missing`, (done) => {
      const reqData = JSON.stringify(dummyData.nominationAdd)
      const nominationAdd = { request: JSON.parse(reqData) }
      nominationAdd.request.program_id = programId
      delete nominationAdd.request[field]
      chai.request(app)
        .post(BASE_URL + '/nomination/add')
        .set('Accept', 'application/json')
        .send(nominationAdd)
        // eslint-disable-next-line handle-callback-err
        .end((err, res) => {
          expect(res.status).to.equal(400)
          done()
        })
    })
  })

  // eslint-disable-next-line no-undef
  it('it should update a nomination', (done) => {
    const nominationUpdate = { request: dummyData.nominationUpdate }
    nominationUpdate.request.program_id = programId
    chai.request(app)
      .post(BASE_URL + '/nomination/update')
      .set('Accept', 'application/json')
      .send(nominationUpdate)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        done()
      })
  })

  _.forEach(dummyData.mandatoryFieldsNominationUpdate, field => {
    // eslint-disable-next-line no-undef
    it(`it should not update a nomination if ${field} is missing`, (done) => {
      const reqData = JSON.stringify(dummyData.nominationUpdate)
      const nominationUpdate = { request: JSON.parse(reqData) }
      nominationUpdate.request.program_id = programId
      delete nominationUpdate.request[field]
      chai.request(app)
        .post(BASE_URL + '/nomination/update')
        .set('Accept', 'application/json')
        .send(nominationUpdate)
        // eslint-disable-next-line handle-callback-err
        .end((err, res) => {
          expect(res.status).to.equal(400)
          done()
        })
    })
  })  

  // eslint-disable-next-line no-undef
  it('it should list nominations', (done) => {
    const nominationList = {request: {filters: {program_id: programId}} }
    chai.request(app)
      .post(BASE_URL + '/nomination/list')
      .set('Accept', 'application/json')
      .send(nominationList)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.be.a('array');
        expect(res.body.result[0]).to.have.property('userData');
        expect(res.body.result[0]).to.have.property('orgData');
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should list nominations with facets', (done) => {
    const nominationList = {request: {filters: {user_id: dummyData.nominationAdd.user_id}, facets: ['status']} }
    chai.request(app)
      .post(BASE_URL + '/nomination/list')
      .set('Accept', 'application/json')
      .send(nominationList)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.be.a('array');
        expect(res.body.result[0]).to.have.property('status');
        expect(res.body.result[0]).to.have.property('count');
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should list nominations with limit = 0', (done) => {
    const nominationList = {request: {fields: ['status', 'content_types'], limit: 0} }
    chai.request(app)
      .post(BASE_URL + '/nomination/list')
      .set('Accept', 'application/json')
      .send(nominationList)
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result.nomination).to.have.property('count');
        expect(res.body.result.nomination).to.have.property('fields');
        expect(_.find(res.body.result.nomination.fields, {name: 'status'})).to.not.be.undefined;
        expect(_.find(res.body.result.nomination.fields, {name: 'content_types'})).to.have.property('count');
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should get contentTypes', (done) => {
    chai.request(app)
      .get(BASE_URL + '/contenttypes/list')
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.have.property('contentType');
        expect(res.body.result.contentType).to.be.a('array');
        if (res.body.result.contentType.length) {
          expect(res.body.result.contentType[0]).to.have.property('name');
          expect(res.body.result.contentType[0]).to.have.property('value');
        }
        done()
      })
  })

  // eslint-disable-next-line no-undef
  it('it should search configuration with key', (done) => {
    chai.request(app)
      .post(BASE_URL + '/configuration/search')
      .set('Accept', 'application/json')
      .send({request: {key: 'contentVideoSize', status: 'active'}})
      // eslint-disable-next-line handle-callback-err
      .end((err, res) => {
        expect(res.status).to.equal(200)
        expect(res.body.result).to.have.property('configuration');
        expect(res.body.result.configuration).to.have.property('value');
        done()
      })
  })
})
