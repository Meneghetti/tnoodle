import React, { Component } from "react";
import { connect } from "react-redux";
import { MAX_WCA_ROUNDS } from "../constants/wca.constants";
import { updateWcaEvent, updateFileZipBlob } from "../redux/ActionCreators";
import {
    getDefaultCopiesExtension,
    copiesExtensionId,
} from "../api/tnoodle.api";
import MbldDetail from "./MbldDetail";
import FmcTranslationsDetail from "./FmcTranslationsDetail";

const mapStateToProps = (store) => ({
    editingDisabled: store.editingDisabled,
    wcif: store.wcif,
    wcaFormats: store.wcaFormats,
});

const mapDispatchToProps = {
    updateWcaEvent,
    updateFileZipBlob,
};

const EventPicker = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        getWcaEvent = (rounds) => {
            return { id: this.props.event.id, rounds };
        };

        handleNumberOfRoundsChange = (rounds, value) => {
            let numberOfRounds = Number(value);

            if (numberOfRounds < 0 || numberOfRounds > MAX_WCA_ROUNDS) {
                return;
            }

            // Ajust the number of rounds in case we have to remove
            while (rounds.length > numberOfRounds) {
                rounds.pop();
            }

            // case we have to add
            let eventId = this.props.event.id;
            while (rounds.length < numberOfRounds) {
                rounds.push({
                    id: eventId + "-r" + (rounds.length + 1),
                    format: this.props.event.format_ids[0],
                    scrambleSetCount: 1,
                    extensions: [getDefaultCopiesExtension()],
                });
            }
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleNumberOfScrambleSetsChange = (round, value, rounds) => {
            if (value < 1) {
                return;
            }
            rounds[round].scrambleSetCount = Number(value);
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleRoundFormatChanged = (round, value, rounds) => {
            rounds[round].format = value;
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        handleNumberOfCopiesChange = (round, value, rounds) => {
            if (value < 1) {
                return;
            }
            rounds[round].extensions.find(
                (extension) => extension.id === copiesExtensionId
            ).data.numCopies = value;
            let wcaEvent = this.getWcaEvent(rounds);
            this.updateEvent(wcaEvent);
        };

        abbreviate = (str) => {
            if (this.props.wcaFormats != null) {
                return this.props.wcaFormats[str].shortName;
            }
            return "-";
        };

        updateEvent = (wcaEvent) => {
            this.props.updateFileZipBlob(null);
            this.props.updateWcaEvent(wcaEvent);
        };

        maybeShowTableTitles = (rounds) => {
            if (rounds.length === 0) {
                return null;
            }
            return (
                <tr className="thead-light">
                    <th scope="col">#</th>
                    <th scope="col">Format</th>
                    <th scope="col">Scramble Sets</th>
                    <th scope="col">Copies</th>
                </tr>
            );
        };

        maybeShowTableBody = (rounds) => {
            if (rounds.length === 0) {
                return;
            }

            return (
                <tbody>
                    {Array.from({ length: rounds.length }, (_, i) => {
                        let copies = rounds[i].extensions.find(
                            (extension) => extension.id === copiesExtensionId
                        ).data.numCopies;
                        return (
                            <tr key={i} className="form-group">
                                <th scope="row" className="align-middle">
                                    {i + 1}
                                </th>
                                <td className="align-middle">
                                    <select
                                        value={rounds[i].format}
                                        onChange={(evt) =>
                                            this.handleRoundFormatChanged(
                                                i,
                                                evt.target.value,
                                                rounds
                                            )
                                        }
                                        disabled={
                                            this.props.editingDisabled
                                                ? "disabled"
                                                : ""
                                        }
                                    >
                                        {this.props.event.format_ids.map(
                                            (format) => (
                                                <option
                                                    key={format}
                                                    value={format}
                                                >
                                                    {this.abbreviate(format)}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={rounds[i].scrambleSetCount}
                                        onChange={(evt) =>
                                            this.handleNumberOfScrambleSetsChange(
                                                i,
                                                Number(evt.target.value),
                                                rounds
                                            )
                                        }
                                        min={1}
                                        disabled={
                                            this.props.editingDisabled
                                                ? "disabled"
                                                : ""
                                        }
                                    />
                                </td>
                                <td>
                                    <input
                                        className="form-control"
                                        type="number"
                                        value={copies}
                                        onChange={(evt) =>
                                            this.handleNumberOfCopiesChange(
                                                i,
                                                Number(evt.target.value),
                                                rounds
                                            )
                                        }
                                        min={1}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            );
        };

        render() {
            let wcaEvent = this.props.wcif.events.find(
                (event) => event.id === this.props.event.id
            );
            let rounds = wcaEvent != null ? wcaEvent.rounds : [];

            let styleFirstTwoColumns = { width: "10%" };
            let styleLastTwoColumns = { width: "40%" };

            let disabled = this.props.editingDisabled;

            return (
                <table className="table table-sm m-0 shadow rounded">
                    <thead>
                        <tr
                            className={
                                rounds.length === 0
                                    ? "bg-secondary text-white"
                                    : "thead-light"
                            }
                        >
                            <th style={styleFirstTwoColumns} scope="col"></th>
                            <th
                                style={styleFirstTwoColumns}
                                scope="col"
                                className="align-middle"
                            >
                                <img
                                    className="img-thumbnail"
                                    src={require(`../assets/cubing-icon/${this.props.event.id}.svg`)}
                                    alt="TNoodle logo"
                                />
                            </th>
                            <th
                                style={styleLastTwoColumns}
                                className="align-middle"
                                scope="col"
                            >
                                <h5 className="font-weight-bold">
                                    {this.props.event.name}
                                </h5>
                            </th>
                            <th style={styleLastTwoColumns} scope="col">
                                <label>Rounds</label>
                                <input
                                    className="bg-light form-control"
                                    type="number"
                                    value={rounds.length}
                                    onChange={(evt) =>
                                        this.handleNumberOfRoundsChange(
                                            rounds,
                                            Number(evt.target.value)
                                        )
                                    }
                                    min={0}
                                    max={MAX_WCA_ROUNDS}
                                    disabled={disabled ? "disabled" : ""}
                                />
                            </th>
                        </tr>
                        {this.maybeShowTableTitles(rounds)}
                    </thead>
                    {this.maybeShowTableBody(rounds)}
                    {this.props.event.is_multiple_blindfolded &&
                        rounds.length > 0 && <MbldDetail />}
                    {this.props.event.is_fewest_moves && rounds.length > 0 && (
                        <FmcTranslationsDetail />
                    )}
                </table>
            );
        }
    }
);

export default EventPicker;
